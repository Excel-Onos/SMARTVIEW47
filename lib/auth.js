import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_a_strong_secret";

/**
 * Sign a JWT for the given payload.
 * @param {Object} payload - Data to encode into the token
 * @param {Object} opts - Optional options (e.g. { expiresIn: '1h' })
 * @returns {string} Signed JWT
 */
export function signToken(payload, opts = {}) {
  const { expiresIn = "7d" } = opts;
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify a JWT and return the decoded payload, or null if invalid.
 * @param {string} token
 * @returns {Object|null}
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}