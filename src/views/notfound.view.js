// 404 fallback view for unknown routes.
import { el } from '../utils/dom.js';

export function notFoundView() {
  return el('div', { class: 'text-center py-5' }, [
    el('h1', { class: 'display-1 fw-bold text-primary' }, '404'),
    el('p', { class: 'lead' }, 'The page you are looking for does not exist.'),
    el('a', { class: 'btn btn-primary', href: '#/catalog' }, 'Back to Showtimes'),
  ]);
}
