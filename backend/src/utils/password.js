const crypto = require('crypto');

/**
 * Hashes a plaintext password using crypto.scryptSync with a unique salt.
 * @param {string} password
 * @returns {string} Salt and hashed string formatted as `salt:hash`
 */
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
};

/**
 * Compares a plaintext password against a stored `salt:hash` string.
 * @param {string} password - Plaintext password to test
 * @param {string} storedHash - Stored `salt:hash`
 * @returns {boolean} True if password matches
 */
const comparePassword = (password, storedHash) => {
  if (!password || !storedHash || !storedHash.includes(':')) {
    return false;
  }
  const [salt, key] = storedHash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
};

module.exports = {
  hashPassword,
  comparePassword,
};
