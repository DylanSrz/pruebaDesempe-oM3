// Session persistence using localStorage so the session survives page refreshes.

const STORAGE_KEY = 'cineapp.session';

/** Persist the authenticated user. */
export function setSession(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

/** Return the current user or null if no active session. */
export function getUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return getUser() != null;
}

export function getRole() {
  return getUser()?.role ?? null;
}

export function isAdmin() {
  return getRole() === 'admin';
}

/** Clear all session data (full logout). */
export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}
