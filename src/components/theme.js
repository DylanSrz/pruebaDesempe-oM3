// Dark mode handling via Bootstrap 5 `data-bs-theme`, persisted in localStorage.

const THEME_KEY = 'cineapp.theme';

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

export function applyTheme(theme = getTheme()) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

/** Toggle between light and dark, returning the new theme. */
export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
