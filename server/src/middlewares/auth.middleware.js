import { verifyJwt } from '../utils/jwt.js';
import { sendError } from '../utils/apiResponse.js';
import prisma from '../config/prisma.js';

/**
 * Middleware to authenticate requests using JWT Bearer token.
 * Attaches authenticated user object to `req.user`.
 * 
 * @param {import('express').Request & { user?: any }} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return sendError(res, {
        statusCode: 401,
        message: 'Access denied: Authorization token required in Bearer format',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyJwt(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id, isActive: true },
      select: {
        id: true,
        did: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        designation: true,
        isActive: true,
      },
    });

    if (!user) {
      return sendError(res, {
        statusCode: 401,
        message: 'Unauthorized: User account does not exist or has been disabled',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, {
        statusCode: 401,
        message: 'Session expired: Please log in again',
      });
    }
    return sendError(res, {
      statusCode: 401,
      message: 'Unauthorized: Invalid authentication token',
    });
  }
}

/**
 * Middleware to restrict route access to specific user roles.
 * @param  {...string} allowedRoles
 * @returns {import('express').RequestHandler}
 */
export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, {
        statusCode: 401,
        message: 'Authentication required before role verification',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, {
        statusCode: 403,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
}

export default { authenticateToken, requireRoles };
