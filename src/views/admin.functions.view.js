// Admin: full CRUD over cinema functions. New functions must reference a room.
import { el } from '../utils/dom.js';
import {
  getFunctions,
  createFunction,
  updateFunction,
  deleteFunction,
} from '../api/functions.api.js';
import { getRooms } from '../api/rooms.api.js';
import { openModal, confirmDialog } from '../components/modal.js';
import { toastSuccess, toastError } from '../components/toast.js';
import { formatDate, statusColor, statusLabel } from '../utils/format.js';
import { required, isPositiveInt, firstError } from '../utils/validators.js';
import { navigate } from '../router/router.js';

function functionForm(rooms, fn = {}) {
  const movie = el('input', { class: 'form-control', value: fn.movie || '' });

  const room = el('select', { class: 'form-select' },
    rooms.map((r) =>
      el('option', { value: String(r.id), selected: r.id === fn.roomId }, `${r.name} (${r.type}, cap ${r.capacity})`)
    )
  );

  const date = el('input', { type: 'date', class: 'form-control', value: fn.date || '' });
  const time = el('input', { type: 'time', class: 'form-control', value: fn.time || '' });
  const capacity = el('input', {
    type: 'number',
    class: 'form-control',
    min: '1',
    value: fn.totalCapacity != null ? String(fn.totalCapacity) : '',
  });
  const status = el('select', { class: 'form-select' }, [
    el('option', { value: 'active', selected: fn.status !== 'cancelled' }, 'Active'),
    el('option', { value: 'cancelled', selected: fn.status === 'cancelled' }, 'Cancelled'),
  ]);

  // Pre-fill capacity from the selected room when creating a new function.
  if (fn.totalCapacity == null) {
    const selected = rooms.find((r) => String(r.id) === room.value);
    if (selected) capacity.value = String(selected.capacity);
  }
  room.addEventListener('change', () => {
    if (fn.id) return; // don't overwrite when editing existing
    const selected = rooms.find((r) => String(r.id) === room.value);
    if (selected) capacity.value = String(selected.capacity);
  });

  const error = el('div', { class: 'text-danger small mt-2 d-none' });

  const field = (label, control) =>
    el('div', { class: 'mb-3' }, [el('label', { class: 'form-label' }, label), control]);

  const node = el('form', {}, [
    field('Movie', movie),
    field('Room', room),
    el('div', { class: 'row' }, [
      el('div', { class: 'col' }, field('Date', date)),
      el('div', { class: 'col' }, field('Time', time)),
    ]),
    field('Total capacity', capacity),
    field('Status', status),
    error,
  ]);

  return { node, read: () => ({ movie, room, date, time, capacity, status, error }) };
}

export async function adminFunctionsView() {
  let [functions, rooms] = await Promise.all([getFunctions(), getRooms()]);

  if (!rooms.length) {
    return el('div', { class: 'alert alert-warning' }, [
      'You must create at least one room before adding functions. ',
      el('a', { href: '#/admin/rooms' }, 'Go to Rooms'),
    ]);
  }

  const reload = () => navigate('/admin/functions');

  function openForm(fn) {
    const isEdit = !!fn;
    const { node, read } = functionForm(rooms, fn || {});
    openModal({
      title: isEdit ? 'Edit function' : 'New function',
      body: node,
      confirmText: isEdit ? 'Save' : 'Create',
      onConfirm: async () => {
        const f = read();
        f.error.classList.add('d-none');
        const capacityVal = Number(f.capacity.value);
        const invalid = firstError([
          required(f.movie.value, 'Movie'),
          required(f.date.value, 'Date'),
          required(f.time.value, 'Time'),
          isPositiveInt(capacityVal, 'Capacity'),
        ]);
        if (invalid) {
          f.error.textContent = invalid;
          f.error.classList.remove('d-none');
          return false;
        }

        const roomId = Number(f.room.value);
        try {
          if (isEdit) {
            // Preserve already-sold seats when capacity changes.
            const sold = fn.totalCapacity - fn.availableSeats;
            await updateFunction(fn.id, {
              ...fn,
              movie: f.movie.value.trim(),
              roomId,
              date: f.date.value,
              time: f.time.value,
              totalCapacity: capacityVal,
              availableSeats: Math.max(0, capacityVal - sold),
              status: f.status.value,
            });
            toastSuccess('Function updated.');
          } else {
            await createFunction({
              movie: f.movie.value.trim(),
              roomId,
              date: f.date.value,
              time: f.time.value,
              totalCapacity: capacityVal,
              availableSeats: capacityVal,
              status: f.status.value,
            });
            toastSuccess('Function created.');
          }
          reload();
        } catch (err) {
          f.error.textContent = err.message;
          f.error.classList.remove('d-none');
          return false;
        }
      },
    });
  }

  const roomName = (id) => rooms.find((r) => r.id === id)?.name ?? `#${id}`;

  const tbody = el('tbody', {});
  functions.forEach((fn) => {
    const editBtn = el('button', { class: 'btn btn-sm btn-outline-primary' }, 'Edit');
    editBtn.addEventListener('click', () => openForm(fn));

    const delBtn = el('button', { class: 'btn btn-sm btn-outline-danger' }, 'Delete');
    delBtn.addEventListener('click', async () => {
      const ok = await confirmDialog({
        title: 'Delete function',
        message: `Delete "${fn.movie}"? This cannot be undone.`,
        confirmText: 'Delete',
      });
      if (!ok) return;
      try {
        await deleteFunction(fn.id);
        toastSuccess('Function deleted.');
        reload();
      } catch (err) {
        toastError(err.message);
      }
    });

    tbody.append(
      el('tr', {}, [
        el('td', {}, fn.movie),
        el('td', {}, roomName(fn.roomId)),
        el('td', {}, `${formatDate(fn.date)} · ${fn.time}`),
        el('td', { class: 'text-center' }, `${fn.availableSeats}/${fn.totalCapacity}`),
        el('td', {}, el('span', { class: `badge text-bg-${statusColor(fn.status)}` }, statusLabel(fn.status))),
        el('td', { class: 'table-actions text-nowrap' }, [editBtn, delBtn]),
      ])
    );
  });

  const newBtn = el('button', { class: 'btn btn-primary' }, '+ New function');
  newBtn.addEventListener('click', () => openForm(null));

  return el('div', {}, [
    el('div', { class: 'd-flex justify-content-between align-items-center mb-3' }, [
      el('h1', { class: 'h3 mb-0' }, 'Manage Functions'),
      newBtn,
    ]),
    el('div', { class: 'table-responsive' }, [
      el('table', { class: 'table table-hover align-middle' }, [
        el('thead', {}, el('tr', {}, [
          el('th', {}, 'Movie'),
          el('th', {}, 'Room'),
          el('th', {}, 'Showtime'),
          el('th', { class: 'text-center' }, 'Seats'),
          el('th', {}, 'Status'),
          el('th', {}, 'Actions'),
        ])),
        tbody,
      ]),
    ]),
  ]);
}
