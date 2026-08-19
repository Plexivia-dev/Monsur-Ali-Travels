import bcrypt from 'bcryptjs';

/**
 * Hashes a plaintext password using bcrypt.
 * @param {string} password - Plaintext password
 * @param {number} [saltRounds=10] - Salt work factor
 * @returns {Promise<string>} Password hash
 */
export async function hashPassword(password, saltRounds = 10) {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verifies a plaintext password against a bcrypt hash.
 * @param {string} password - Plaintext password
 * @param {string} hash - Bcrypt hash
 * @returns {Promise<boolean>} Match result
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export default { hashPassword, comparePassword };
