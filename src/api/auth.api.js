import { http } from './http.js';

/**
 * Validate credentials against json-server.
 * Returns the matching user (without the password) or throws on failure.
 */
export async function login(email, password) {
  const matches = await http.get(
    `/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  );

  if (!matches.length) {
    throw new Error('Invalid email or password.');
  }

  const { password: _pw, ...user } = matches[0];
  return user;
}
