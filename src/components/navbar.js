// Dynamic navbar: links depend on the session role; includes theme toggle + logout.
import { el, mount } from '../utils/dom.js';
import { getUser, isAdmin, clearSession } from '../store/session.js';
import { getTheme, toggleTheme } from './theme.js';
import { navigate } from '../router/router.js';

function navLink(href, label) {
  const active = location.hash === `#${href}`;
  return el(
    'li',
    { class: 'nav-item' },
    el('a', { class: `nav-link${active ? ' active' : ''}`, href: `#${href}` }, label)
  );
}

function themeToggle() {
  const btn = el(
    'button',
    { class: 'btn btn-outline-light btn-sm me-2', type: 'button', title: 'Toggle theme' },
    getTheme() === 'dark' ? '☀️' : '🌙'
  );
  btn.addEventListener('click', () => {
    const next = toggleTheme();
    btn.textContent = next === 'dark' ? '☀️' : '🌙';
  });
  return btn;
}

export function renderNavbar() {
  const host = document.getElementById('navbar');
  const user = getUser();

  // Brand always points to catalog (or login when signed out).
  const brand = el(
    'a',
    { class: 'navbar-brand fw-bold', href: user ? '#/catalog' : '#/login' },
    '🎬 CineApp'
  );

  const links = el('ul', { class: 'navbar-nav me-auto mb-2 mb-lg-0' });
  if (user) {
    links.append(navLink('/catalog', 'Showtimes'));
    links.append(navLink('/my-reservations', 'My Reservations'));
    if (isAdmin()) {
      links.append(navLink('/admin/dashboard', 'Dashboard'));
      links.append(navLink('/admin/functions', 'Functions'));
      links.append(navLink('/admin/rooms', 'Rooms'));
      links.append(navLink('/admin/reservations', 'Reservations'));
      links.append(navLink('/admin/users', 'Users'));
    }
  }

  const right = el('div', { class: 'd-flex align-items-center' }, [themeToggle()]);

  if (user) {
    right.append(
      el('span', { class: 'navbar-text text-light me-3 small' }, [
        el('strong', {}, user.name),
        ` (${user.role})`,
      ])
    );
    const logoutBtn = el(
      'button',
      { class: 'btn btn-outline-light btn-sm', type: 'button' },
      'Logout'
    );
    logoutBtn.addEventListener('click', () => {
      clearSession();
      navigate('/login');
    });
    right.append(logoutBtn);
  }

  const toggler = el('button', {
    class: 'navbar-toggler',
    type: 'button',
    'data-bs-toggle': 'collapse',
    'data-bs-target': '#navContent',
  }, el('span', { class: 'navbar-toggler-icon' }));

  const collapse = el(
    'div',
    { class: 'collapse navbar-collapse', id: 'navContent' },
    [links, right]
  );

  const nav = el(
    'nav',
    { class: 'navbar navbar-expand-lg bg-primary' , 'data-bs-theme': 'dark' },
    el('div', { class: 'container' }, [brand, toggler, collapse])
  );

  mount(host, nav);
}
