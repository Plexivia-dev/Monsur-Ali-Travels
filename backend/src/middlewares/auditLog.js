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
  if (cleanUrl.includes('/candidates')) {
    return { targetCollection: 'candidates', type: 'DATA_ENTRY' };
  }
  if (cleanUrl.includes('/customers') || cleanUrl.includes('/clients')) {
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
 * Universal middleware to intercept and log all modifying API operations.
 */
export const auditLog = async (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.on('finish', async () => {
      // Only log successful or client-accepted operations (status < 400)
      if (res.statusCode < 400) {
        const xRealIp = req.headers['x-real-ip'];
        const xForwardedFor = req.headers['x-forwarded-for'];
        const ipAddress = (xRealIp || (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) || req.ip || req.socket?.remoteAddress || '').replace(/^::ffff:/, '');
        const userAgent = req.headers['user-agent'] || '';

        const { targetCollection, type, action: inferredAction } = inferCollectionAndType(req.originalUrl, req.method);
        const action = mapMethodToAction(req.method, inferredAction);

        await logSystemAction({
          type,
          targetCollection,
          action,
          user: req.user || null,
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
