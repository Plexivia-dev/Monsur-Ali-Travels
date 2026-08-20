export function getErrorMessage(err: unknown, fallback = 'An error occurred.'): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    const msg =
      (e.response as Record<string, unknown>)?.data
        ? ((e.response as Record<string, unknown>).data as Record<string, unknown>)?.message
        : e.message;
    if (typeof msg === 'string') return msg;
  }
  return fallback;
}
