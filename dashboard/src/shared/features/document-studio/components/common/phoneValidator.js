/**
 * Utility to validate and normalize Bangladeshi phone numbers.
 * Supports:
 * - Local 11-digit format: 01XXXXXXXXX
 * - Country code formats: +8801XXXXXXXXX or 8801XXXXXXXXX
 */
export function validateBdPhone(phone) {
  if (!phone) {
    return { isValid: false, formatted: '', error: 'Phone number is required' };
  }

  const clean = phone.replace(/\D/g, '');

  // Local 11-digit BD number
  if (clean.length === 11 && clean.startsWith('01')) {
    return { isValid: true, formatted: clean, error: null };
  }

  // Country code with 13 digits (8801XXXXXXXXX)
  if (clean.length === 13 && clean.startsWith('8801')) {
    return { isValid: true, formatted: '0' + clean.slice(2), error: null };
  }

  // Country code with 14 characters (+8801XXXXXXXXX)
  if (phone.trim().startsWith('+') && clean.length === 13 && clean.startsWith('8801')) {
    return { isValid: true, formatted: '0' + clean.slice(2), error: null };
  }

  return {
    isValid: false,
    formatted: phone,
    error: 'Must be a valid Bangladeshi phone number (e.g. 017XXXXXXXX)',
  };
}
