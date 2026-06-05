// Reusable form/value validators. Each returns an error string or null.

export function required(value, label = 'Field') {
  if (value == null || String(value).trim() === '') return `${label} is required.`;
  return null;
}

export function isEmail(value) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(value).trim()) ? null : 'Enter a valid email address.';
}

export function minLength(value, min, label = 'Field') {
  return String(value).length >= min ? null : `${label} must be at least ${min} characters.`;
}

export function isPositiveInt(value, label = 'Value') {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? null : `${label} must be a positive number.`;
}

/**
 * Run a list of validator results and return the first error found.
 * @param {(string|null)[]} results
 * @returns {string|null}
 */
export function firstError(results) {
  return results.find((r) => r != null) ?? null;
}
