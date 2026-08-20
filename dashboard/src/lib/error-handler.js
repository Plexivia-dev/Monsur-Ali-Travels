import { toast } from 'sonner';
import i18n from '../configs/i18n';

const recentToasts = new Map();
const DEBOUNCE_TIME = 2500;

export function getGenericErrorMessage(error, customFallback) {
  if (!error) {
    return customFallback || i18n.t('errors.generic', 'Something went wrong. Please try again.');
  }

  const rawMessage = typeof error === 'string'
    ? error
    : (error?.response?.data?.message ||
       error?.response?.data?.errors?.join(', ') ||
       error?.message ||
       '');

  const lowerMsg = String(rawMessage).toLowerCase();

  // 1. Network / Connection Errors
  if (
    lowerMsg.includes('network error') ||
    lowerMsg.includes('econnrefused') ||
    lowerMsg.includes('etimedout') ||
    lowerMsg.includes('err_network') ||
    lowerMsg.includes('err_connection') ||
    lowerMsg.includes('failed to fetch')
  ) {
    return i18n.t('errors.network', 'Unable to connect to the server. Please check your network connection.');
  }

  // 2. Auth / Unauthorized / Session Expired
  if (
    lowerMsg.includes('401') ||
    lowerMsg.includes('unauthorized') ||
    lowerMsg.includes('jwt') ||
    lowerMsg.includes('token expired') ||
    lowerMsg.includes('invalid credentials')
  ) {
    return i18n.t('errors.unauthorized', 'Session expired or invalid credentials. Please log in again.');
  }

  // 3. Forbidden / Permissions
  if (lowerMsg.includes('403') || lowerMsg.includes('forbidden') || lowerMsg.includes('permission denied')) {
    return i18n.t('errors.forbidden', 'You do not have permission to perform this action.');
  }

  // 4. Not Found
  if (lowerMsg.includes('404') || lowerMsg.includes('not found')) {
    return i18n.t('errors.notFound', 'The requested record was not found.');
  }

  // 5. Technical / Schema / Database / Developer Jargon -> Never show to user
  if (
    lowerMsg.includes('schema validation') ||
    lowerMsg.includes('validation error') ||
    lowerMsg.includes('zod') ||
    lowerMsg.includes('prisma') ||
    lowerMsg.includes('foreign key') ||
    lowerMsg.includes('unique constraint') ||
    lowerMsg.includes('sql') ||
    lowerMsg.includes('syntaxerror') ||
    lowerMsg.includes('typeerror') ||
    lowerMsg.includes('referenceerror') ||
    lowerMsg.includes('internal server error') ||
    lowerMsg.includes('500') ||
    lowerMsg.includes('exception') ||
    lowerMsg.includes('stack') ||
    lowerMsg.includes('undefined') ||
    lowerMsg.includes('null') ||
    lowerMsg.includes('[object object]') ||
    lowerMsg.includes('p2002') ||
    lowerMsg.includes('p2025') ||
    lowerMsg.includes('findunique') ||
    lowerMsg.includes('findmany') ||
    /[{}[\]\\]/.test(rawMessage)
  ) {
    if (lowerMsg.includes('validation') || lowerMsg.includes('schema') || lowerMsg.includes('invalid')) {
      return i18n.t('errors.validation', 'Please check your inputs and try again.');
    }
    return i18n.t('errors.server', 'Server is temporarily unavailable. Please try again later.');
  }

  // 6. If it's a clean, non-technical, human-readable message, return it or fallback
  if (rawMessage && rawMessage.length > 0 && rawMessage.length < 120) {
    return rawMessage;
  }

  return customFallback || i18n.t('errors.generic', 'Something went wrong. Please try again.');
}

export function getApiErrorMessage(error, customFallback) {
  return getGenericErrorMessage(error, customFallback);
}

export function handleGlobalError(error, customFallback) {
  const safeMessage = getGenericErrorMessage(error, customFallback);
  const now = Date.now();

  // Deduplicate by message content within debounce window
  const lastTime = recentToasts.get(safeMessage) || 0;
  if (now - lastTime < DEBOUNCE_TIME) {
    return safeMessage;
  }

  recentToasts.set(safeMessage, now);

  // Clean up old entries
  if (recentToasts.size > 20) {
    for (const [k, v] of recentToasts.entries()) {
      if (now - v > 10000) recentToasts.delete(k);
    }
  }

  toast.error(safeMessage, { id: safeMessage });
  return safeMessage;
}

export default handleGlobalError;
