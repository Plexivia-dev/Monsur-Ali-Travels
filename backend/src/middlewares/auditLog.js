import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserModel } from '../models/user.model.js';
import { logSystemAction } from '../helper/auditLogger.js';

/**
 * Infers target collection and domain category from request URL path.
 */
function inferCollectionAndType(url, method) {
  const cleanUrl = (url || '').split('?')[0].toLowerCase();

  // 1. Auth & Session
  if (cleanUrl.includes('/auth/login')) {
    return { targetCollection: 'users', type: 'AUTH', action: 'AUTH_LOGIN' };
  }
  if (cleanUrl.includes('/auth/logout')) {
    return { targetCollection: 'users', type: 'AUTH', action: 'AUTH_LOGOUT' };
  }

  // 2. Financial / Payments
  if (cleanUrl.includes('/receipts') || cleanUrl.includes('/money-receipts')) {
    return { targetCollection: 'moneyReceipts', type: 'PAYMENT' };
  }
  if (cleanUrl.includes('/cash-vouchers')) {
    return { targetCollection: 'cashVouchers', type: 'PAYMENT' };
  }
  if (cleanUrl.includes('/invoices')) {
    return { targetCollection: 'invoices', type: 'PAYMENT' };
  }
  if (cleanUrl.includes('/salary-slips') || cleanUrl.includes('/payrolls') || cleanUrl.includes('/salaries')) {
    return { targetCollection: 'salarySlips', type: 'PAYMENT' };
  }

  // 3. Document Studio
  if (cleanUrl.includes('/job-verification') || cleanUrl.includes('/job-verifications')) {
    return { targetCollection: 'jobVerifications', type: 'DOC_STUDIO' };
  }
  if (cleanUrl.includes('/experience-certificate') || cleanUrl.includes('/experience-certificates')) {
    return { targetCollection: 'experienceCertificates', type: 'DOC_STUDIO' };
  }
  if (cleanUrl.includes('/marriage-certificate') || cleanUrl.includes('/marriage-certificates')) {
    return { targetCollection: 'marriageCertificates', type: 'DOC_STUDIO' };
  }
  if (cleanUrl.includes('/character-certificate') || cleanUrl.includes('/character-certificates')) {
    return { targetCollection: 'characterCertificates', type: 'DOC_STUDIO' };
  }
  if (cleanUrl.includes('/agreements') || cleanUrl.includes('/employment-agreements')) {
    return { targetCollection: 'agreements', type: 'DOC_STUDIO' };
  }
  if (cleanUrl.includes('/id-card') || cleanUrl.includes('/idcards') || cleanUrl.includes('/id-cards')) {
    return { targetCollection: 'idCards', type: 'DOC_STUDIO' };
  }
  if (cleanUrl.includes('/client-guardians') || cleanUrl.includes('/customer-guardians')) {
    return { targetCollection: 'clientGuardians', type: 'DATA_ENTRY' };
  }

  // 4. Workflow & Tasks
  if (cleanUrl.includes('/tasks') && (cleanUrl.includes('/done') || cleanUrl.includes('/approve') || cleanUrl.includes('/assign'))) {
    return { targetCollection: 'tasks', type: 'TASK_EXECUTION', action: 'STATUS_TRANSITION' };
  }
  if (cleanUrl.includes('/tasks')) {
    return { targetCollection: 'tasks', type: 'TASK_EXECUTION' };
  }
  if (cleanUrl.includes('/cases') && (cleanUrl.includes('/stage') || cleanUrl.includes('/status'))) {
    return { targetCollection: 'caseFiles', type: 'STATUS_CHANGE', action: 'STATUS_TRANSITION' };
  }
  if (cleanUrl.includes('/cases')) {
    return { targetCollection: 'caseFiles', type: 'STATUS_CHANGE' };
  }

  // 5. Data Entry & Registry
  if (cleanUrl.includes('/indian-visas') || cleanUrl.includes('/indian-visa')) {
    return { targetCollection: 'indianVisas', type: 'DATA_ENTRY' };
  }
  if (cleanUrl.includes('/passports') || cleanUrl.includes('/passport-submissions')) {
    return { targetCollection: 'passports', type: 'DATA_ENTRY' };
  }
  if (cleanUrl.includes('/clients')) {
    return { targetCollection: 'clients', type: 'DATA_ENTRY' };
  }
  if (cleanUrl.includes('/users')) {
    return { targetCollection: 'users', type: 'SYSTEM' };
  }

  return { targetCollection: 'general', type: 'DATA_ENTRY' };
}

/**
 * Maps HTTP method to action enum.
 */
function mapMethodToAction(method, explicitAction) {
  if (explicitAction) return explicitAction;
  switch (method) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'SOFT_DELETE';
    default:
      return 'UPDATE';
  }
}

/**
 * Generates an informative human summary of the user's data action.
 */
function generateUserActionSummary(user, targetCollection, action, body = {}) {
  const userName = user.name || user.email || 'User';
  const role = user.role || 'Staff';

  const identifier =
    body.verificationId ||
    body.slipNo ||
    body.invoiceNo ||
    body.receiptNo ||
    body.voucherNo ||
    body.agreementId ||
    body.applicationNo ||
    body.trackingNo ||
    body.certificateNo ||
    body.idNumber ||
    body.caseNumber ||
    body.clientInfo?.clientName ||
    body.parties?.employeeName ||
    body.employeeName ||
    body.client?.fullName ||
    body.clientName ||
    body.applicantName ||
    body.candidateName ||
    body.groomName ||
    body.fullName ||
    body.paidTo ||
    body.name ||
    body.title ||
    '';

  const amount = body.amount || body.paidAmount || body.netSalaryPayable || body.grossSalary || body.grandTotal || body.totalAmount || body.total;
  const status = body.workflowStatus || body.status || body.stage || body.workflowStage;

  const targetNames = {
    jobVerifications: 'Job Verification',
    experienceCertificates: 'Experience Certificate',
    marriageCertificates: 'Marriage Certificate',
    characterCertificates: 'Character Certificate',
    agreements: 'Employment Agreement',
    salarySlips: 'Salary Slip',
    invoices: 'Invoice',
    moneyReceipts: 'Money Receipt',
    cashVouchers: 'Cash Voucher',
    clientGuardians: 'Client & Guardian Application',
    indianVisas: 'Indian Visa Application',
    passports: 'Passport Submission',
    idCards: 'Employee ID Card',
    clients: 'Client Profile',
    caseFiles: 'Case File',
    tasks: 'Workflow Task',
    users: 'User Account',
  };

  const targetLabel = targetNames[targetCollection] || targetCollection;

  if (action === 'STATUS_TRANSITION' || (status && (action === 'UPDATE' || targetCollection === 'caseFiles'))) {
    return `${userName} (${role}) updated ${targetLabel} status to "${status || 'Updated'}"${identifier ? ` for ${identifier}` : ''}`;
  }

  if (action === 'CREATE') {
    if (amount) {
      return `${userName} (${role}) created ${targetLabel} of BDT ${Number(amount).toLocaleString('en-IN')}${identifier ? ` (${identifier})` : ''}`;
    }
    return `${userName} (${role}) created ${targetLabel}${identifier ? `: ${identifier}` : ''}`;
  }

  if (action === 'UPDATE') {
    if (amount) {
      return `${userName} (${role}) edited ${targetLabel} (BDT ${Number(amount).toLocaleString('en-IN')})${identifier ? ` (${identifier})` : ''}`;
    }
    return `${userName} (${role}) updated ${targetLabel}${identifier ? `: ${identifier}` : ''}`;
  }

  if (action === 'SOFT_DELETE' || action === 'DELETE') {
    return `${userName} (${role}) removed ${targetLabel}${identifier ? ` (${identifier})` : ''}`;
  }

  return `${userName} (${role}) updated ${targetLabel}`;
}

/**
 * Universal middleware to intercept and log ONLY REAL USER BUSINESS DATA operations.
 * Strictly ignores system automated tasks, polling, unauthenticated calls, or internal API hits.
 */
export const auditLog = async (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.on('finish', async () => {
      // Only log successful operations
      if (res.statusCode < 400) {
        let user = req.user;

        // If req.user is not yet attached, extract from authorization token
        if (!user && req.headers.authorization) {
          try {
            const [scheme, token] = req.headers.authorization.split(' ');
            if (scheme === 'Bearer' && token) {
              const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
              const userDid = payload?.did || payload?.userId || payload?.id || payload?.sub;
              if (userDid) {
                const dbUser = await UserModel.findOne({ did: userDid }).lean();
                if (dbUser && dbUser.isActive !== false) {
                  user = {
                    _id: dbUser.did,
                    id: dbUser.did,
                    userId: dbUser.did,
                    did: dbUser.did,
                    name: dbUser.name,
                    email: dbUser.email,
                    role: dbUser.role,
                  };
                }
              }
            }
          } catch (_) {
            // Ignore token decode errors for logging middleware
          }
        }

        // STRICT FILTER: Never log automated system processes or unauthenticated hits
        if (!user || (!user.name && !user.email) || user.role === 'System' || user.name === 'System Process') {
          return;
        }

        const { targetCollection, type, action: explicitAction } = inferCollectionAndType(req.originalUrl || req.url, req.method);
        const action = mapMethodToAction(req.method, explicitAction);
        const summary = generateUserActionSummary(user, targetCollection, action, req.body);

        await logSystemAction({
          type,
          targetCollection,
          action,
          summary,
          user,
          payload: req.body,
          ipAddress: req.ip || req.connection?.remoteAddress || '',
          userAgent: req.get('user-agent') || '',
        });
      }
    });
  }

  next();
};

export default auditLog;
