import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * @typedef {Object} JwtPayload
 * @property {string} id - User ID
 * @property {string} email - User Email
 * @property {string} role - User Role
 * @property {string} did - User DID
 * @property {string} name - User Name
 */

/**
 * Signs a new JSON Web Token.
 * @param {JwtPayload} payload
 * @param {string} [secret=env.JWT_SECRET]
 * @param {string} [expiresIn=env.JWT_EXPIRES_IN]
 * @returns {string} Signed JWT string
 */
export function signJwt(payload, secret = env.JWT_SECRET, expiresIn = env.JWT_EXPIRES_IN) {
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verifies and decodes a JSON Web Token.
 * @param {string} token
 * @param {string} [secret=env.JWT_SECRET]
 * @returns {JwtPayload} Decoded token payload
 */
export function verifyJwt(token, secret = env.JWT_SECRET) {
  return /** @type {JwtPayload} */ (jwt.verify(token, secret));
}

export default { signJwt, verifyJwt };
