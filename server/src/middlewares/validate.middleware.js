import { ZodError } from 'zod';
import { sendError } from '../utils/apiResponse.js';

/**
 * Express middleware to validate request against a Zod schema.
 * Supports validating body, query, and params.
 * 
 * @param {import('zod').ZodSchema} schema - Zod Schema to validate against
 * @returns {import('express').RequestHandler}
 */
export function validate(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace with validated/coerced data
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.').replace(/^(body|query|params)\./, ''),
          location: err.path[0] || 'body',
          message: err.message,
        }));

        return sendError(res, {
          statusCode: 400,
          message: 'Validation failed: Invalid request parameters or body',
          errors: formattedErrors,
        });
      }

      next(error);
    }
  };
}

export default validate;
