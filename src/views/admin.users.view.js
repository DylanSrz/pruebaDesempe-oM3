// Admin: list registered users (extra module). Read-only directory.
import { el } from '../utils/dom.js';
import { getUsers } from '../api/users.api.js';
import { getReservations } from '../api/reservations.api.js';

export async function adminUsersView() {
  const [users, reservations] = await Promise.all([getUsers(), getReservations()]);
  const reservationCount = (userId) => reservations.filter((r) => r.userId === userId).length;

  const tbody = el('tbody', {},
    users.map((u) =>
      el('tr', {}, [
        el('td', {}, String(u.id)),
        el('td', {}, u.name),
        el('td', {}, u.email),
        el('td', {}, el('span', { class: `badge text-bg-${u.role === 'admin' ? 'primary' : 'secondary'}` }, u.role)),
        el('td', { class: 'text-center' }, String(reservationCount(u.id))),
      ])
    )
  );

  return el('div', {}, [
    el('h1', { class: 'h3 mb-3' }, 'Registered Users'),
    el('div', { class: 'table-responsive' }, [
      el('table', { class: 'table table-hover align-middle' }, [
        el('thead', {}, el('tr', {}, [
          el('th', {}, 'ID'),
          el('th', {}, 'Name'),
          el('th', {}, 'Email'),
          el('th', {}, 'Role'),
          el('th', { class: 'text-center' }, 'Reservations'),
        ])),
        tbody,
      ]),
    ]),
  ]);
}
