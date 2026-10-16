/**
 * Universal UUID Validation and Normalization Utility
 * Guards Supabase queries against PostgreSQL 22P02 syntax exceptions.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Checks whether a given string is a valid RFC 4122 UUID.
 * @param {any} val - The input value to check
 * @returns {boolean} True if val is a valid UUID string
 */
export function isValidUuid(val) {
  if (!val || typeof val !== 'string') return false;
  return UUID_REGEX.test(val.trim());
}

/**
 * Sanitizes a UUID string, returning null (or a specified fallback) if invalid.
 * Prevents passing strings like "temp-123", "test_id", or undefined to Postgres UUID columns.
 * @param {any} val - The input value to sanitize
 * @param {any} [fallback=null] - Value returned if validation fails
 * @returns {string|null} Valid trimmed UUID or fallback
 */
export function sanitizeUuid(val, fallback = null) {
  if (isValidUuid(val)) {
    return val.trim();
  }
  return fallback;
}

/**
 * Validates a parameter and throws a descriptive client error if invalid.
 * @param {any} val - The input value
 * @param {string} [paramName='ID'] - The parameter name for the error message
 * @returns {string} The valid UUID
 */
export function requireValidUuid(val, paramName = 'ID') {
  if (!isValidUuid(val)) {
    throw new Error(`Invalid ${paramName}: must be a valid 36-character UUID string.`);
  }
  return val.trim();
}
