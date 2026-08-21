import { SystemLogModel } from '../models/systemLog.model.js';
import { logger } from '../config/logger.js';

/**
 * Middleware to log admin actions (POST, PUT, PATCH, DELETE) to the database.
 */
export const auditLog = async (req, res, next) => {
  // Only log modifying requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    // Attach a listener to capture response status
    res.on('finish', async () => {
      try {
        const xRealIp = req.headers['x-real-ip'];
        const xForwardedFor = req.headers['x-forwarded-for'];
        const ipAddress = (xRealIp || (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) || req.ip || req.socket?.remoteAddress || 'Unknown IP').replace(/^::ffff:/, '');

        // Redact sensitive data from payload
        const payload = { ...req.body };
        if (payload.password) payload.password = '***REDACTED***';
        if (payload.token) payload.token = '***REDACTED***';

        const logEntry = new SystemLogModel({
          userId: req.user?._id || req.user?.id || null,
          email: req.user?.email || 'Unknown',
          role: req.user?.role || 'Unknown',
          action: `${req.method} ${req.originalUrl}`,
          method: req.method,
          endpoint: req.originalUrl,
          ipAddress,
          payload,
          status: res.statusCode >= 400 ? 'error' : 'success'
        });

        await logEntry.save();
      } catch (error) {
        logger.error(`Failed to save audit log: ${error.message}`);
      }
    });
  }
  next();
};
