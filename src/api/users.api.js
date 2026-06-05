import { http } from './http.js';

/** List users without exposing their passwords. */
export async function getUsers() {
  const users = await http.get('/users');
  return users.map(({ password: _pw, ...rest }) => rest);
}
