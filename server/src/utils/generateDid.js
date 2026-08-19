import crypto from 'crypto';

/**
 * Generates a 16-character decentralized unique hex identifier (DID).
 * @returns {string} 16-character hexadecimal string
 */
export function generateDid() {
  return crypto.randomBytes(8).toString('hex');
}

export default generateDid;
