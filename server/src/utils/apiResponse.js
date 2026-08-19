/**
 * @typedef {Object} PaginationMeta
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} totalCount - Total matching records
 * @property {number} totalPages - Total computed pages
 * @property {number} skip - Offset items skipped
 * @property {boolean} hasNextPage - Has next page available
 * @property {boolean} hasPrevPage - Has previous page available
 */

/**
 * Sends a standardized success API response
 * @param {import('express').Response} res
 * @param {Object} options
 * @param {number} [options.statusCode=200]
 * @param {string} [options.message="Success"]
 * @param {any} [options.data=null]
 * @param {PaginationMeta} [options.pagination]
 */
export function sendSuccess(res, { statusCode = 200, message = 'Success', data = null, pagination = undefined }) {
  const payload = {
    success: true,
    status: 'success',
    message,
    data,
  };

  if (pagination) {
    payload.pagination = pagination;
  }

  return res.status(statusCode).json(payload);
}

/**
 * Sends a standardized error API response
 * @param {import('express').Response} res
 * @param {Object} options
 * @param {number} [options.statusCode=500]
 * @param {string} [options.message="Internal Server Error"]
 * @param {any} [options.errors=null]
 */
export function sendError(res, { statusCode = 500, message = 'Internal Server Error', errors = null }) {
  const payload = {
    success: false,
    status: 'error',
    message,
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
}

/**
 * Helper to compute standardized pagination metadata
 * @param {number} totalCount
 * @param {number} page
 * @param {number} limit
 * @returns {PaginationMeta}
 */
export function getPaginationMeta(totalCount, page, limit) {
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const skip = (page - 1) * limit;
  return {
    page,
    limit,
    totalCount,
    totalPages,
    skip,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
