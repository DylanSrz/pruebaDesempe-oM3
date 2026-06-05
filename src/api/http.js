// Thin fetch wrapper around the json-server REST API.
// Centralizes the base URL, JSON handling and error normalization.

export const BASE_URL = 'http://localhost:3000';

/**
 * Perform a request and parse the JSON response.
 * Throws an Error with a readable message on non-2xx responses or network failures.
 */
async function request(path, { method = 'GET', body, headers } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body != null ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error('Cannot reach the server. Is json-server running on port 3000?');
  }

  if (!res.ok) {
    throw new Error(`Request failed (${res.status} ${res.statusText}).`);
  }

  // DELETE on json-server returns an empty object; guard against empty bodies.
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const http = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
