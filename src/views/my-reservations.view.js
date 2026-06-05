// "My Reservations": users manage their own bookings (view/edit/cancel).
import { el } from '../utils/dom.js';
import { getReservationsByUser } from '../api/reservations.api.js';
import { getFunctions } from '../api/functions.api.js';
import { getUser, isAdmin } from '../store/session.js';
import { changeTickets, cancelReservation, hasStarted } from '../services/reservations.service.js';
import { openModal, confirmDialog } from '../components/modal.js';
import { toastSuccess, toastError } from '../components/toast.js';
import { formatDate, formatDateTime, statusColor, statusLabel } from '../utils/format.js';
import { isPositiveInt, firstError } from '../utils/validators.js';
import { navigate } from '../router/router.js';

function editModal(reservation, fn, onDone) {
  const ticketsInput = el('input', {
    type: 'number',
    class: 'form-control',
    min: '1',
    value: String(reservation.tickets),
  });
  const error = el('div', { class: 'text-danger small mt-2 d-none' });

  openModal({
    title: `Edit reservation — ${fn.movie}`,
    body: el('div', {}, [
      el('p', { class: 'text-secondary small' }, `${fn.availableSeats} seats currently available`),
      el('label', { class: 'form-label' }, 'Number of tickets'),
      ticketsInput,
      error,
    ]),
    confirmText: 'Save changes',
    onConfirm: async () => {
      error.classList.add('d-none');
      const tickets = Number(ticketsInput.value);
      const invalid = firstError([isPositiveInt(tickets, 'Tickets')]);
      if (invalid) {
        error.textContent = invalid;
        error.classList.remove('d-none');
        return false;
      }
      try {
        await changeTickets({ reservation, tickets, isAdmin: isAdmin() });
        toastSuccess('Reservation updated.');
        onDone();
      } catch (err) {
        error.textContent = err.message;
        error.classList.remove('d-none');
        return false;
      }
    },
  });
}

function reservationRow(reservation, fn, reload) {
  const movie = fn ? fn.movie : `Function #${reservation.functionId}`;
  const when = fn ? `${formatDate(fn.date)} · ${fn.time}` : '—';
  const editable = reservation.status !== 'cancelled' && fn && !hasStarted(fn);

  const editBtn = el(
    'button',
    { class: 'btn btn-sm btn-outline-primary', disabled: !editable },
    'Edit'
  );
  if (editable) editBtn.addEventListener('click', () => editModal(reservation, fn, reload));

  const cancelBtn = el(
    'button',
    { class: 'btn btn-sm btn-outline-danger', disabled: reservation.status === 'cancelled' },
    'Cancel'
  );
  if (reservation.status !== 'cancelled') {
    cancelBtn.addEventListener('click', async () => {
      const ok = await confirmDialog({
        title: 'Cancel reservation',
        message: `Cancel your reservation for "${movie}"? Seats will be released.`,
        confirmText: 'Yes, cancel',
      });
      if (!ok) return;
      try {
        await cancelReservation(reservation.id);
        toastSuccess('Reservation cancelled.');
        reload();
      } catch (err) {
        toastError(err.message);
      }
    });
  }

  return el('tr', {}, [
    el('td', {}, movie),
    el('td', {}, when),
    el('td', { class: 'text-center' }, String(reservation.tickets)),
    el('td', {}, el('span', { class: `badge text-bg-${statusColor(reservation.status)}` }, statusLabel(reservation.status))),
    el('td', { class: 'small text-secondary' }, formatDateTime(reservation.reservationDate)),
    el('td', { class: 'table-actions text-nowrap' }, [editBtn, cancelBtn]),
  ]);
}

export async function myReservationsView() {
  const user = getUser();
  const [reservations, functions] = await Promise.all([
    getReservationsByUser(user.id),
    getFunctions(),
  ]);
  const fnById = (id) => functions.find((f) => f.id === id);

  const container = el('div', {});

  function render() {
    container.replaceChildren();
    container.append(
      el('div', { class: 'd-flex justify-content-between align-items-center mb-3' }, [
        el('h1', { class: 'h3 mb-0' }, 'My Reservations'),
        el('a', { class: 'btn btn-primary', href: '#/catalog' }, '+ Book new'),
      ])
    );

    if (!reservations.length) {
      container.append(
        el('div', { class: 'alert alert-info' }, 'You have no reservations yet.')
      );
      return;
    }

    const tbody = el('tbody', {});
    reservations.forEach((r) => {
      tbody.append(reservationRow(r, fnById(r.functionId), () => navigate('/my-reservations')));
    });

    container.append(
      el('div', { class: 'table-responsive' }, [
        el('table', { class: 'table table-hover align-middle' }, [
          el('thead', {}, el('tr', {}, [
            el('th', {}, 'Movie'),
            el('th', {}, 'Showtime'),
            el('th', { class: 'text-center' }, 'Tickets'),
            el('th', {}, 'Status'),
            el('th', {}, 'Booked on'),
            el('th', {}, 'Actions'),
          ])),
          tbody,
        ]),
      ])
    );
  }

  render();
  return container;
}
