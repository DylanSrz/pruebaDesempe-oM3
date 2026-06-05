// Hash-based SPA router with simulated route guards (auth + role).
import { isAuthenticated, getRole } from '../store/session.js';
import { renderNavbar } from '../components/navbar.js';
import { el } from '../utils/dom.js';

let routes = [];
let appEl = null;

/** Parse the current hash into { path, params }. Supports `#/path?query`. */
function parseHash() {
  const raw = location.hash.slice(1) || '/';
  const [path, queryStr = ''] = raw.split('?');
  const params = Object.fromEntries(new URLSearchParams(queryStr));
  return { path: path || '/', params };
}

/** Match a path against the route table, supporting `:param` segments. */
function matchRoute(path) {
  for (const route of routes) {
    const routeParts = route.path.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);
    if (routeParts.length !== pathParts.length) continue;

    const params = {};
    const matched = routeParts.every((part, i) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = decodeURIComponent(pathParts[i]);
        return true;
      }
      return part === pathParts[i];
    });

    if (matched) return { route, routeParams: params };
  }
  return null;
}

/** Programmatic navigation. */
export function navigate(path) {
  if (location.hash === `#${path}`) handleRoute();
  else location.hash = path;
}

async function renderView(view, context) {
  appEl.replaceChildren(
    el('div', { class: 'text-center py-5 text-secondary' }, 'Loading…')
  );
  try {
    const node = await view(context);
    appEl.replaceChildren(node);
  } catch (err) {
    appEl.replaceChildren(
      el('div', { class: 'alert alert-danger' }, err.message || 'Unexpected error.')
    );
  }
}

async function handleRoute() {
  const { path, params } = parseHash();
  renderNavbar();

  const match = matchRoute(path);
  if (!match) {
    const notFound = routes.find((r) => r.path === '*');
    if (notFound) await renderView(notFound.view, { params, routeParams: {} });
    return;
  }

  const { route, routeParams } = match;
  const meta = route.meta || {};

  // Guard: authentication required.
  if (meta.auth && !isAuthenticated()) {
    return navigate('/login');
  }

  // Guard: role authorization.
  if (meta.roles && !meta.roles.includes(getRole())) {
    appEl.replaceChildren(
      el('div', { class: 'alert alert-warning' }, [
        el('h4', { class: 'alert-heading' }, '403 — Access denied'),
        el('p', { class: 'mb-0' }, 'You do not have permission to view this page.'),
      ])
    );
    return;
  }

  // Redirect authenticated users away from the login page.
  if (path === '/login' && isAuthenticated()) {
    return navigate('/catalog');
  }

  await renderView(route.view, { params, routeParams });
  window.scrollTo(0, 0);
}

/** Initialize the router with a route table. */
export function startRouter(routeTable) {
  routes = routeTable;
  appEl = document.getElementById('app');
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('load', handleRoute);
  handleRoute();
}
