/**
 * Utility to validate and normalize Bangladeshi phone numbers.
 * Supports:
 * - Local 11-digit format: 013XXXXXXXX - 019XXXXXXXX
 * - Country code formats: +8801XXXXXXXXX or 8801XXXXXXXXX
 * - Formatted inputs: +880 1345-579534, 01712-345678, etc.
 */
export function validateBdPhone(phone) {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return { isValid: false, formatted: '', error: 'Phone number is required' };
  }

  const trimmed = phone.trim();
  const clean = trimmed.replace(/\D/g, '');

  let normalized = clean;
  // If starts with 8801... (13 digits), strip 88 -> 01XXXXXXXXX
  if (clean.length === 13 && clean.startsWith('8801')) {
    normalized = clean.slice(2);
  } else if (clean.length === 14 && clean.startsWith('88001')) {
    normalized = clean.slice(3);
  } else if (clean.length === 10 && clean.startsWith('1')) {
    normalized = '0' + clean;
  }

  // BD standard: 11 digits starting with 013, 014, 015, 016, 017, 018, 019
  const bdRegex = /^01[3-9]\d{8}$/;

  if (bdRegex.test(normalized)) {
    return { isValid: true, formatted: normalized, error: null };
  }

  if (normalized.length > 0 && !normalized.startsWith('01')) {
    return {
      isValid: false,
      formatted: phone,
      error: 'Phone number must start with 01 (e.g. 017XXXXXXXX)',
    };
  }

  if (normalized.length > 0 && normalized.length !== 11) {
    return {
      isValid: false,
      formatted: phone,
      error: `Invalid length (${normalized.length}/11 digits). Must be 11 digits`,
    };
  }

  return {
    isValid: false,
    formatted: phone,
    error: 'Must be a valid Bangladeshi mobile number (013-019)',
  };
}

export default validateBdPhone;
