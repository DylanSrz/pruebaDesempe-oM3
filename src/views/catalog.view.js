// Catalog (cartelera): lists active functions with search + date filter and booking.
import { el } from '../utils/dom.js';
import { getFunctions } from '../api/functions.api.js';
import { getRooms } from '../api/rooms.api.js';
import { getUser } from '../store/session.js';
import { bookTickets, hasStarted } from '../services/reservations.service.js';
import { openModal } from '../components/modal.js';
import { toastSuccess, toastError } from '../components/toast.js';
import { formatDate, statusColor, statusLabel } from '../utils/format.js';
import { isPositiveInt, firstError } from '../utils/validators.js';
import { navigate } from '../router/router.js';

function bookingModal(fn, onDone) {
  const ticketsInput = el('input', {
    type: 'number',
    class: 'form-control',
    min: '1',
    max: String(fn.availableSeats),
    value: '1',
  });
  const error = el('div', { class: 'text-danger small mt-2 d-none' });

  const body = el('div', {}, [
    el('p', { class: 'mb-1' }, [el('strong', {}, fn.movie)]),
    el('p', { class: 'text-secondary small' }, `${formatDate(fn.date)} · ${fn.time} · ${fn.availableSeats} seats left`),
    el('label', { class: 'form-label' }, 'Number of tickets'),
    ticketsInput,
    error,
  ]);

  openModal({
    title: 'Book tickets',
    body,
    confirmText: 'Confirm booking',
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
        await bookTickets({ userId: getUser().id, functionId: fn.id, tickets });
        toastSuccess(`Booked ${tickets} ticket(s) for ${fn.movie}.`);
        onDone();
      } catch (err) {
        error.textContent = err.message;
        error.classList.remove('d-none');
        return false;
      }
    },
  });
}

function functionCard(fn, roomName, onBooked) {
  const soldOut = fn.availableSeats <= 0;
  const started = hasStarted(fn);
  const disabled = fn.status !== 'active' || soldOut || started;

  const bookBtn = el(
    'button',
    { class: 'btn btn-sm btn-primary w-100', disabled },
    fn.status !== 'active' ? 'Unavailable' : soldOut ? 'Sold out' : started ? 'Started' : 'Book'
  );
  if (!disabled) bookBtn.addEventListener('click', () => bookingModal(fn, onBooked));

  return el('div', { class: 'col-sm-6 col-lg-4' }, [
    el('div', { class: 'card h-100 card-poster shadow-sm' }, [
      el('div', { class: 'movie-thumb' }, '🎬'),
      el('div', { class: 'card-body' }, [
        el('div', { class: 'd-flex justify-content-between align-items-start' }, [
          el('h5', { class: 'card-title mb-1' }, fn.movie),
          el('span', { class: `badge text-bg-${statusColor(fn.status)}` }, statusLabel(fn.status)),
        ]),
        el('p', { class: 'card-text small text-secondary mb-2' }, [
          el('div', {}, `📅 ${formatDate(fn.date)} · ${fn.time}`),
          el('div', {}, `🏟️ ${roomName}`),
          el('div', {}, `🎟️ ${fn.availableSeats} / ${fn.totalCapacity} seats available`),
        ]),
      ]),
      el('div', { class: 'card-footer bg-transparent border-0' }, bookBtn),
    ]),
  ]);
}

export async function catalogView() {
  const [functions, rooms] = await Promise.all([getFunctions(), getRooms()]);
  const roomName = (id) => rooms.find((r) => r.id === id)?.name ?? `Room #${id}`;

  const grid = el('div', { class: 'row g-3' });
  const empty = el('div', { class: 'alert alert-info d-none' }, 'No functions match your search.');

  const searchInput = el('input', {
    type: 'search',
    class: 'form-control',
    placeholder: 'Search by movie…',
  });
  const dateInput = el('input', { type: 'date', class: 'form-control' });

  function renderList() {
    const term = searchInput.value.trim().toLowerCase();
    const date = dateInput.value;
    const filtered = functions.filter((f) => {
      const matchTerm = !term || f.movie.toLowerCase().includes(term);
      const matchDate = !date || f.date === date;
      return matchTerm && matchDate;
    });

    grid.replaceChildren(
      ...filtered.map((f) => functionCard(f, roomName(f.roomId), () => navigate('/my-reservations')))
    );
    empty.classList.toggle('d-none', filtered.length > 0);
  }

  searchInput.addEventListener('input', renderList);
  dateInput.addEventListener('change', renderList);

  const clearBtn = el('button', { class: 'btn btn-outline-secondary', type: 'button' }, 'Clear');
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    dateInput.value = '';
    renderList();
  });

  const toolbar = el('div', { class: 'row g-2 mb-4' }, [
    el('div', { class: 'col-md-6' }, searchInput),
    el('div', { class: 'col-md-4' }, dateInput),
    el('div', { class: 'col-md-2' }, clearBtn),
  ]);

  renderList();

  return el('div', {}, [
    el('h1', { class: 'h3 mb-3' }, 'Showtimes'),
    toolbar,
    empty,
    grid,
  ]);
}
