// Admin: view all reservations and approve / cancel / delete them.
import { el } from '../utils/dom.js';
import { getReservations, deleteReservation } from '../api/reservations.api.js';
import { getFunctions } from '../api/functions.api.js';
import { getUsers } from '../api/users.api.js';
import { setReservationStatus } from '../services/reservations.service.js';
import { confirmDialog } from '../components/modal.js';
import { toastSuccess, toastError } from '../components/toast.js';
import { formatDate, formatDateTime, statusColor, statusLabel } from '../utils/format.js';
import { navigate } from '../router/router.js';

export async function adminReservationsView() {
  const [reservations, functions, users] = await Promise.all([
    getReservations(),
    getFunctions(),
    getUsers(),
  ]);

  const fnById = (id) => functions.find((f) => f.id === id);
  const userById = (id) => users.find((u) => u.id === id);
  const reload = () => navigate('/admin/reservations');

  // Status filter
  const filter = el('select', { class: 'form-select w-auto' }, [
    el('option', { value: 'all' }, 'All statuses'),
    el('option', { value: 'pending' }, 'Pending'),
    el('option', { value: 'confirmed' }, 'Confirmed'),
    el('option', { value: 'cancelled' }, 'Cancelled'),
  ]);

  const tbody = el('tbody', {});

  function renderRows() {
    const status = filter.value;
    const rows = reservations.filter((r) => status === 'all' || r.status === status);
    tbody.replaceChildren();

    if (!rows.length) {
      tbody.append(el('tr', {}, el('td', { colspan: '7', class: 'text-center text-secondary py-4' }, 'No reservations.')));
      return;
    }

    rows.forEach((r) => {
      const fn = fnById(r.functionId);
      const user = userById(r.userId);

      const approveBtn = el(
        'button',
        { class: 'btn btn-sm btn-outline-success', disabled: r.status !== 'pending' },
        'Approve'
      );
      approveBtn.addEventListener('click', async () => {
        try {
          await setReservationStatus(r.id, 'confirmed');
          toastSuccess('Reservation confirmed.');
          reload();
        } catch (err) {
          toastError(err.message);
        }
      });

      const cancelBtn = el(
        'button',
        { class: 'btn btn-sm btn-outline-warning', disabled: r.status === 'cancelled' },
        'Cancel'
      );
      cancelBtn.addEventListener('click', async () => {
        try {
          await setReservationStatus(r.id, 'cancelled');
          toastSuccess('Reservation cancelled, seats released.');
          reload();
        } catch (err) {
          toastError(err.message);
        }
      });

      const delBtn = el('button', { class: 'btn btn-sm btn-outline-danger' }, 'Delete');
      delBtn.addEventListener('click', async () => {
        const ok = await confirmDialog({
          title: 'Delete reservation',
          message: 'Permanently delete this reservation record?',
          confirmText: 'Delete',
        });
        if (!ok) return;
        try {
          await deleteReservation(r.id);
          toastSuccess('Reservation deleted.');
          reload();
        } catch (err) {
          toastError(err.message);
        }
      });

      tbody.append(
        el('tr', {}, [
          el('td', {}, user ? user.name : `User #${r.userId}`),
          el('td', {}, fn ? fn.movie : `Function #${r.functionId}`),
          el('td', {}, fn ? `${formatDate(fn.date)} · ${fn.time}` : '—'),
          el('td', { class: 'text-center' }, String(r.tickets)),
          el('td', {}, el('span', { class: `badge text-bg-${statusColor(r.status)}` }, statusLabel(r.status))),
          el('td', { class: 'small text-secondary' }, formatDateTime(r.reservationDate)),
          el('td', { class: 'table-actions text-nowrap' }, [approveBtn, cancelBtn, delBtn]),
        ])
      );
    });
  }

  filter.addEventListener('change', renderRows);
  renderRows();

  return el('div', {}, [
    el('div', { class: 'd-flex justify-content-between align-items-center mb-3' }, [
      el('h1', { class: 'h3 mb-0' }, 'All Reservations'),
      filter,
    ]),
    el('div', { class: 'table-responsive' }, [
      el('table', { class: 'table table-hover align-middle' }, [
        el('thead', {}, el('tr', {}, [
          el('th', {}, 'User'),
          el('th', {}, 'Movie'),
          el('th', {}, 'Showtime'),
          el('th', { class: 'text-center' }, 'Tickets'),
          el('th', {}, 'Status'),
          el('th', {}, 'Booked on'),
          el('th', {}, 'Actions'),
        ])),
        tbody,
      ]),
    ]),
  ]);
}
