import { toast } from 'sonner';

/**
 * Generic user-friendly fallback error message
 */
export const GENERIC_ERROR_MESSAGE = 'An unexpected error occurred. Please try again later.';

/**
 * Safely extract a backend API error message from an unknown catch payload.
 */
export function getApiErrorMessage(error: any, customFallback?: string): string {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.join(', ') ||
    error?.message ||
    customFallback ||
    GENERIC_ERROR_MESSAGE
  );
}

/**
 * Sanitizes raw error payloads into clean, actionable notifications.
 */
export function getGenericErrorMessage(error: any, customFallback?: string): string {
  if (!error) {
    return customFallback || GENERIC_ERROR_MESSAGE;
  }

  const rawMessage = typeof error === 'string'
    ? error
    : getApiErrorMessage(error, '');

  const lowerMsg = rawMessage.toLowerCase();

  // Filter out any internal traces or database exceptions
  if (
    lowerMsg.includes('sql') ||
    lowerMsg.includes('syntaxerror') ||
    lowerMsg.includes('internal server error') ||
    lowerMsg.includes('exception') ||
    lowerMsg.includes('stack') ||
    lowerMsg.includes('undefined') ||
    lowerMsg.includes('null')
  ) {
    return customFallback || GENERIC_ERROR_MESSAGE;
  }

  // Handle common HTTP / network statuses
  if (lowerMsg.includes('network error') || lowerMsg.includes('econnrefused')) {
    return 'Unable to connect to the server. Please check your network connection.';
  }

  if (lowerMsg.includes('401') || lowerMsg.includes('unauthorized') || lowerMsg.includes('invalid credentials')) {
    return 'Invalid email or password. Please try again.';
  }

  if (lowerMsg.includes('403') || lowerMsg.includes('forbidden')) {
    return 'You do not have permission to perform this action.';
  }

  if (lowerMsg.includes('404') || lowerMsg.includes('not found')) {
    return 'The requested resource was not found.';
  }

  if (rawMessage && rawMessage.length < 120 && !/[{}[\]\\]/.test(rawMessage)) {
    return rawMessage;
  }

  return customFallback || GENERIC_ERROR_MESSAGE;
}

/**
 * Global Error Handler function
 * Displays a sanitized error toast using sonner.
 */
export function handleGlobalError(error: any, customFallback?: string): string {
  const safeMessage = getGenericErrorMessage(error, customFallback);
  toast.error(safeMessage);
  return safeMessage;
}
