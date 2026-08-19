import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { sendError } from '../utils/apiResponse.js';
import env from '../config/env.js';

/**
 * Global Express Error Handling Middleware.
 * Maps Prisma codes, Zod errors, JWT errors, and unhandled exceptions into uniform API responses.
 * 
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function errorHandler(err, req, res, next) {
  if (env.NODE_ENV === 'development') {
    console.error('💥 Unhandled Exception:', err);
  }

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.').replace(/^(body|query|params)\./, ''),
      message: e.message,
    }));
    return sendError(res, {
      statusCode: 400,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  // 2. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint failed
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
      return sendError(res, {
        statusCode: 409,
        message: `Duplicate entry error: A record with this ${target} already exists.`,
      });
    }

    // P2025: Record not found
    if (err.code === 'P2025') {
      return sendError(res, {
        statusCode: 404,
        message: 'The requested record was not found in database.',
      });
    }

    // P2003: Foreign key constraint failed
    if (err.code === 'P2003') {
      return sendError(res, {
        statusCode: 400,
        message: 'Foreign key constraint failed: Related record does not exist.',
      });
    }
  }

  // 3. JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, {
      statusCode: 401,
      message: 'Invalid authorization token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, {
      statusCode: 401,
      message: 'Authorization token has expired, please log in again',
    });
  }

  // 4. Custom HTTP Errors with statusCode
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  return sendError(res, {
    statusCode,
    message,
    errors: env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

/**
 * 404 Not Found Middleware for unmatched routes
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function notFoundHandler(req, res) {
  return sendError(res, {
    statusCode: 404,
    message: `API endpoint '${req.method} ${req.originalUrl}' does not exist on this server.`,
  });
}

export default { errorHandler, notFoundHandler };
