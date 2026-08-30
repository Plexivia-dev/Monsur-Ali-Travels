import { SystemLogModel } from '../models/systemLog.model.js';
import { NotificationModel } from '../models/notification.model.js';
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
 * Maps collection and action to human-friendly notification titles.
 */
function getNotificationTitle(targetCollection, action) {
  const titles = {
    jobVerifications: { CREATE: 'Job Verification Generated', UPDATE: 'Job Verification Updated', SOFT_DELETE: 'Job Verification Removed' },
    experienceCertificates: { CREATE: 'Experience Certificate Created', UPDATE: 'Experience Certificate Updated', SOFT_DELETE: 'Certificate Removed' },
    marriageCertificates: { CREATE: 'Marriage Certificate Generated', UPDATE: 'Marriage Certificate Updated', SOFT_DELETE: 'Certificate Removed' },
    characterCertificates: { CREATE: 'Character Certificate Generated', UPDATE: 'Character Certificate Updated', SOFT_DELETE: 'Certificate Removed' },
    agreements: { CREATE: 'Employment Agreement Created', UPDATE: 'Employment Agreement Updated', SOFT_DELETE: 'Agreement Removed' },
    salarySlips: { CREATE: 'Salary Slip Issued', UPDATE: 'Salary Slip Updated', SOFT_DELETE: 'Salary Slip Removed' },
    invoices: { CREATE: 'Invoice Created', UPDATE: 'Invoice Updated', SOFT_DELETE: 'Invoice Removed' },
    moneyReceipts: { CREATE: 'Money Receipt Issued', UPDATE: 'Money Receipt Updated', SOFT_DELETE: 'Money Receipt Removed' },
    cashVouchers: { CREATE: 'Cash Voucher Created', UPDATE: 'Cash Voucher Updated', SOFT_DELETE: 'Cash Voucher Removed' },
    clientGuardians: { CREATE: 'Client Application Submitted', UPDATE: 'Client Application Updated', SOFT_DELETE: 'Application Removed' },
    indianVisas: { CREATE: 'Indian Visa Intake Logged', UPDATE: 'Indian Visa Intake Updated', SOFT_DELETE: 'Record Removed' },
    passports: { CREATE: 'Passport Submission Logged', UPDATE: 'Passport Record Updated', SOFT_DELETE: 'Passport Record Removed' },
    idCards: { CREATE: 'Employee ID Card Created', UPDATE: 'Employee ID Card Updated', SOFT_DELETE: 'ID Card Removed' },
    caseFiles: { CREATE: 'Case File Created', UPDATE: 'Case File Updated', STATUS_TRANSITION: 'Case Status Updated', SOFT_DELETE: 'Case File Removed' },
    tasks: { CREATE: 'Task Assigned', UPDATE: 'Task Updated', STATUS_TRANSITION: 'Task Status Changed', SOFT_DELETE: 'Task Removed' },
    users: { CREATE: 'User Account Created', UPDATE: 'User Account Updated', SOFT_DELETE: 'User Account Disabled' },
  };

  if (titles[targetCollection]?.[action]) {
    return titles[targetCollection][action];
  }

  const actionName = action === 'CREATE' ? 'Created' : action === 'UPDATE' ? 'Updated' : action === 'SOFT_DELETE' ? 'Removed' : 'Updated';
  const cleanTarget = String(targetCollection || 'Record').replace(/([A-Z])/g, ' $1').trim();
  return `${cleanTarget.charAt(0).toUpperCase() + cleanTarget.slice(1)} ${actionName}`;
}

/**
 * Enterprise helper to record structured audit logs for REAL USERS.
 * Never logs automated system calls or unnamed processes.
 */
export async function logSystemAction({
  type = 'DATA_ENTRY',
  targetCollection = 'general',
  action = 'CREATE',
  summary = '',
  user = null,
  payload = null,
  ipAddress = '',
  userAgent = '',
}) {
  try {
    // STRICT RULE: Only record logs for real authenticated human users
    if (!user || (!user.name && !user.email) || user.role === 'System' || user.name === 'System Process') {
      return null;
    }

    const userDid = user.did || user.id || user._id?.toString();
    const userName = user.name || user.email;
    const userRole = ['Owner', 'Admin', 'Manager', 'Staff', 'Super_Admin', 'Superadmin'].includes(user.role)
      ? user.role
      : 'Staff';

    const logEntry = new SystemLogModel({
      did: generateDid(),
      createdBy: userDid,
      updatedBy: userDid,
      type,
      targetCollection,
      action,
      summary: summary || `${userName} (${userRole}) performed ${action} on ${targetCollection}`,
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
