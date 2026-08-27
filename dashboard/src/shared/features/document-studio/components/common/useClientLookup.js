import { useRef, useCallback } from 'react';
import { apiClient } from '@shared/lib/api-client';
import { validateBdPhone } from './phoneValidator';

/**
 * useClientLookup
 *
 * Reusable hook for all Document Studio forms.
 * Performs a debounced (1000ms) lookup against the client database
 * when a phone number or email address is entered.
 *
 * Usage:
 *   const { triggerLookup, resetLookup } = useClientLookup({
 *     onClientFound: (client, activeCaseFile) => setDetectedClient({ client, caseFile }),
 *   });
 *
 *   // In phone input onChange:
 *   triggerLookup(phoneValue);
 *
 *   // When modal is dismissed:
 *   resetLookup();
 */
export function useClientLookup({ onClientFound }) {
  const debounceRef = useRef(null);
  const promptedValuesRef = useRef(new Set());

  const triggerLookup = useCallback(
    (value) => {
      if (!value || typeof value !== 'string') return;
      const trimmed = value.trim();

      const isEmail = trimmed.includes('@') && trimmed.length >= 5;
      const isPhone = /^[0-9+\-\s()]+$/.test(trimmed) && trimmed.replace(/\D/g, '').length >= 8;

      let queryVal = trimmed;
      if (isPhone) {
        const bdCheck = validateBdPhone(trimmed);
        if (!bdCheck.isValid) return; // Do not query if not a valid BD phone number
        queryVal = bdCheck.formatted; // Use standardized 11-digit format
      } else if (!isEmail) {
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        try {
          const res = await apiClient.get('/api/v1/client/clients/lookup', {
            params: { query: queryVal },
          });

          if (res.data?.success && res.data?.data && res.data.data.length > 0) {
            const matched = res.data.data[0];

            // Also fetch active case file for this client
            let activeCaseFile = null;
            if (matched._id || matched.did) {
              try {
                const caseRes = await apiClient.get('/api/v1/admin/cases', {
                  params: {
                    clientId: matched._id,
                    status: 'active,processing,new,pending',
                    limit: 1,
                    sort: '-createdAt',
                  },
                });
                const cases = caseRes.data?.data || [];
                if (cases.length > 0) {
                  // Filter: not completed, deleted, or inactive
                  const openCase = cases.find(
                    (c) =>
                      !['completed', 'deleted', 'inactive', 'cancelled'].includes(
                        String(c.status || '').toLowerCase()
                      )
                  );
                  activeCaseFile = openCase || null;
                }
              } catch (_) {
                // Case lookup is optional — proceed without it
              }
            }

            promptedValuesRef.current.add(trimmed);
            onClientFound(matched, activeCaseFile);
          }
        } catch (err) {
          console.warn('[useClientLookup] Lookup skipped:', err.message);
        }
      }, 1000);
    },
    [onClientFound]
  );

  const resetLookup = useCallback((valueToReset) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (valueToReset) {
      // Allow this value to be prompted again if user re-enters
      promptedValuesRef.current.delete(valueToReset.trim());
    }
  }, []);

  return { triggerLookup, resetLookup };
}
