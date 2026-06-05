// Route table: maps hash paths to views with auth/role metadata for the guards.
import { loginView } from './views/login.view.js';
import { catalogView } from './views/catalog.view.js';
import { myReservationsView } from './views/my-reservations.view.js';
import { adminFunctionsView } from './views/admin.functions.view.js';
import { adminReservationsView } from './views/admin.reservations.view.js';
import { adminRoomsView } from './views/admin.rooms.view.js';
import { adminUsersView } from './views/admin.users.view.js';
import { adminDashboardView } from './views/admin.dashboard.view.js';
import { notFoundView } from './views/notfound.view.js';

export const routes = [
  { path: '/', view: catalogView, meta: { auth: true } },
  { path: '/login', view: loginView },
  { path: '/catalog', view: catalogView, meta: { auth: true } },
  { path: '/my-reservations', view: myReservationsView, meta: { auth: true, roles: ['user', 'admin'] } },

  // Admin-only modules
  { path: '/admin/functions', view: adminFunctionsView, meta: { auth: true, roles: ['admin'] } },
  { path: '/admin/reservations', view: adminReservationsView, meta: { auth: true, roles: ['admin'] } },
  { path: '/admin/rooms', view: adminRoomsView, meta: { auth: true, roles: ['admin'] } },
  { path: '/admin/users', view: adminUsersView, meta: { auth: true, roles: ['admin'] } },
  { path: '/admin/dashboard', view: adminDashboardView, meta: { auth: true, roles: ['admin'] } },

  { path: '*', view: notFoundView },
];
