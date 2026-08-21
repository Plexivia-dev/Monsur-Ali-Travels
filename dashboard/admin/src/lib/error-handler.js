export function getErrorMessage(err, fallback = 'An error occurred.') {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const msg = err.response?.data?.message || err.message;
    if (typeof msg === 'string') return msg;
  }
  return fallback;
}
