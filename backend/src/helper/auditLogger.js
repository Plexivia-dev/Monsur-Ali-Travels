import { SystemLogModel } from '../models/systemLog.model.js';
import { logger } from '../config/logger.js';
import { generateDid } from '../utils/generateDid.js';

/**
 * Sanitizes payload to remove sensitive fields before logging.
 */
export function sanitizePayload(data) {
  if (!data || typeof data !== 'object') return data;
  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  const sensitiveKeys = ['password', 'token', 'refreshToken', 'accessToken', 'secret', 'apiKey'];
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizePayload(sanitized[key]);
    }
  }
  return sanitized;
}

/**
 * Enterprise helper to record structured audit logs asynchronously.
 */
export async function logSystemAction({
  type = 'DATA_ENTRY',
  targetCollection = 'general',
  action = 'CREATE',
  user = null,
  payload = null,
  ipAddress = '',
  userAgent = '',
}) {
  try {
    const userDid = user?.did || user?.id || user?._id?.toString() || 'SYSTEM';
    const userName = user?.name || user?.email || 'System Process';
    const userRole = ['Owner', 'Admin', 'Manager', 'Staff'].includes(user?.role)
      ? user.role
      : 'System';

    const logEntry = new SystemLogModel({
      did: generateDid(),
      createdBy: userDid,
      updatedBy: userDid,
      type,
      targetCollection,
      action,
      actionDetails: {
        did: userDid,
        name: userName,
        role: userRole,
        ipAddress: (ipAddress || '').replace(/^::ffff:/, ''),
        userAgent: userAgent || '',
      },
      payload: sanitizePayload(payload),
      isActive: true,
    });

    await logEntry.save();
    return logEntry;
  } catch (error) {
    logger.error(`[AuditLogger] Failed to write system log: ${error.message}`);
    return null;
  }
}

export default logSystemAction;
