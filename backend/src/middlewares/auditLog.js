import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserModel } from '../models/user.model.js';
import { logSystemAction } from '../helper/auditLogger.js';

/**
 * Infers target collection from request URL path.
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
  if (cleanUrl.includes('/payrolls') || cleanUrl.includes('/salary-slips')) {
    return { targetCollection: 'salarySlips', type: 'PAYMENT' };
  }

  // 3. Workflow & Tasks
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

  // 4. Data Entry & Document Records
  if (cleanUrl.includes('/clients')) {
    return { targetCollection: 'clients', type: 'DATA_ENTRY' };
  }
  if (cleanUrl.includes('/clients') || cleanUrl.includes('/clients')) {
    return { targetCollection: 'clients', type: 'DATA_ENTRY' };
  }
  if (cleanUrl.includes('/agreements')) {
    return { targetCollection: 'agreements', type: 'DOC_STUDIO' };
  }
  if (cleanUrl.includes('/indian-visas')) {
    return { targetCollection: 'indianVisas', type: 'DATA_ENTRY' };
  }
  if (cleanUrl.includes('/passports')) {
    return { targetCollection: 'passports', type: 'DATA_ENTRY' };
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
    body.name ||
    body.clientName ||
    body.applicantName ||
    body.clientName ||
    body.holderName ||
    body.title ||
    body.passportNumber ||
    body.receiptNumber ||
    body.voucherNumber ||
    body.invoiceNumber ||
    body.caseNumber ||
    body.fileNumber ||
    '';

  const amount = body.amount || body.paidAmount || body.netSalary || body.totalAmount || body.total;
  const status = body.workflowStatus || body.status || body.stage || body.workflowStage;

  const targetNames = {
    clients: 'Client (ক্লায়েন্ট)',
    caseFiles: 'Case File (ফাইল)',
    moneyReceipts: 'Money Receipt (টাকা জমার রশিদ)',
    cashVouchers: 'Cash Voucher (খরচের ভাউচার)',
    invoices: 'Invoice (ইনভয়েস)',
    salarySlips: 'Salary Slip (বেতন শিট)',
    clients: 'Client (ক্লায়েন্ট)',
    passports: 'Passport Record (পাসপোর্ট)',
    indianVisas: 'Indian Visa (ভিসা আবেদন)',
    agreements: 'Agreement (চুক্তিপত্র)',
    tasks: 'Task (টাস্ক)',
  };

  const targetLabel = targetNames[targetCollection] || targetCollection;

  if (action === 'STATUS_TRANSITION' || (status && (action === 'UPDATE' || targetCollection === 'caseFiles'))) {
    return `${userName} (${role}) updated status of ${targetLabel} to "${status || 'Updated'}"${identifier ? ` for ${identifier}` : ''}`;
  }

  if (action === 'CREATE') {
    if (amount) {
      return `${userName} (${role}) entered new ${targetLabel} of ৳${Number(amount).toLocaleString('en-IN')}${identifier ? ` (#${identifier})` : ''}`;
    }
    return `${userName} (${role}) created new ${targetLabel}${identifier ? `: ${identifier}` : ''}`;
  }

  if (action === 'UPDATE') {
    if (amount) {
      return `${userName} (${role}) edited ${targetLabel} (৳${Number(amount).toLocaleString('en-IN')})${identifier ? ` (#${identifier})` : ''}`;
    }
    return `${userName} (${role}) edited ${targetLabel}${identifier ? `: ${identifier}` : ''}`;
  }

  if (action === 'SOFT_DELETE' || action === 'DELETE') {
    return `${userName} (${role}) deleted ${targetLabel}${identifier ? ` (${identifier})` : ''}`;
  }

  return `${userName} (${role}) performed ${action} on ${targetLabel}`;
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
          } catch (_) {}
        }

        // STRICT FILTER: If there is no real authenticated human user, NEVER log anything!
        if (!user || !user.name || user.name === 'System Process' || user.role === 'System') {
          return;
        }

        const xRealIp = req.headers['x-real-ip'];
        const xForwardedFor = req.headers['x-forwarded-for'];
        const ipAddress = (xRealIp || (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) || req.ip || req.socket?.remoteAddress || '').replace(/^::ffff:/, '');
        const userAgent = req.headers['user-agent'] || '';

        const { targetCollection, type, action: inferredAction } = inferCollectionAndType(req.originalUrl, req.method);
        const action = mapMethodToAction(req.method, inferredAction);
        const summary = generateUserActionSummary(user, targetCollection, action, req.body || {});

        await logSystemAction({
          type,
          targetCollection,
          action,
          summary,
          user,
          payload: {
            method: req.method,
            endpoint: req.originalUrl,
            params: req.params,
            query: req.query,
            body: req.body,
          },
          ipAddress,
          userAgent,
        });
      }
    });
  }
  next();
};

export default auditLog;
