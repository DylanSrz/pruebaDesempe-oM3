// Admin: CRUD over cinema rooms (extra module).
import { el } from '../utils/dom.js';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../api/rooms.api.js';
import { getFunctions } from '../api/functions.api.js';
import { openModal, confirmDialog } from '../components/modal.js';
import { toastSuccess, toastError } from '../components/toast.js';
import { statusColor, statusLabel } from '../utils/format.js';
import { required, isPositiveInt, firstError } from '../utils/validators.js';
import { navigate } from '../router/router.js';

const ROOM_TYPES = ['2D', '3D', 'IMAX'];

function roomForm(room = {}) {
  const name = el('input', { class: 'form-control', value: room.name || '' });
  const capacity = el('input', {
    type: 'number',
    class: 'form-control',
    min: '1',
    value: room.capacity != null ? String(room.capacity) : '',
  });
  const type = el('select', { class: 'form-select' },
    ROOM_TYPES.map((t) => el('option', { value: t, selected: t === room.type }, t))
  );
  const status = el('select', { class: 'form-select' }, [
    el('option', { value: 'active', selected: room.status !== 'inactive' }, 'Active'),
    el('option', { value: 'inactive', selected: room.status === 'inactive' }, 'Inactive'),
  ]);
  const error = el('div', { class: 'text-danger small mt-2 d-none' });

  const field = (label, control) =>
    el('div', { class: 'mb-3' }, [el('label', { class: 'form-label' }, label), control]);

  const node = el('form', {}, [
    field('Name', name),
    field('Capacity', capacity),
    field('Type', type),
    field('Status', status),
    error,
  ]);

  return { node, fields: { name, capacity, type, status, error } };
}

export async function adminRoomsView() {
  const [rooms, functions] = await Promise.all([getRooms(), getFunctions()]);
  const reload = () => navigate('/admin/rooms');
  const usageCount = (roomId) => functions.filter((f) => f.roomId === roomId).length;

  function openForm(room) {
    const isEdit = !!room;
    const { node, fields } = roomForm(room || {});
    openModal({
      title: isEdit ? 'Edit room' : 'New room',
      body: node,
      confirmText: isEdit ? 'Save' : 'Create',
      onConfirm: async () => {
        fields.error.classList.add('d-none');
        const capacityVal = Number(fields.capacity.value);
        const invalid = firstError([
          required(fields.name.value, 'Name'),
          isPositiveInt(capacityVal, 'Capacity'),
        ]);
        if (invalid) {
          fields.error.textContent = invalid;
          fields.error.classList.remove('d-none');
          return false;
        }
        const payload = {
          name: fields.name.value.trim(),
          capacity: capacityVal,
          type: fields.type.value,
          status: fields.status.value,
        };
        try {
          if (isEdit) {
            await updateRoom(room.id, { ...room, ...payload });
            toastSuccess('Room updated.');
          } else {
            await createRoom(payload);
            toastSuccess('Room created.');
          }
          reload();
        } catch (err) {
          fields.error.textContent = err.message;
          fields.error.classList.remove('d-none');
          return false;
        }
      },
    });
  }

  const tbody = el('tbody', {});
  rooms.forEach((room) => {
    const used = usageCount(room.id);
    const editBtn = el('button', { class: 'btn btn-sm btn-outline-primary' }, 'Edit');
    editBtn.addEventListener('click', () => openForm(room));

    const delBtn = el('button', { class: 'btn btn-sm btn-outline-danger', disabled: used > 0, title: used > 0 ? 'Room is used by functions' : '' }, 'Delete');
    if (used === 0) {
      delBtn.addEventListener('click', async () => {
        const ok = await confirmDialog({
          title: 'Delete room',
          message: `Delete room "${room.name}"?`,
          confirmText: 'Delete',
        });
        if (!ok) return;
        try {
          await deleteRoom(room.id);
          toastSuccess('Room deleted.');
          reload();
        } catch (err) {
          toastError(err.message);
        }
      });
    }

    tbody.append(
      el('tr', {}, [
        el('td', {}, room.name),
        el('td', { class: 'text-center' }, String(room.capacity)),
        el('td', {}, el('span', { class: 'badge text-bg-info' }, room.type)),
        el('td', {}, el('span', { class: `badge text-bg-${statusColor(room.status)}` }, statusLabel(room.status))),
        el('td', { class: 'text-center' }, String(used)),
        el('td', { class: 'table-actions text-nowrap' }, [editBtn, delBtn]),
      ])
    );
  });

  const newBtn = el('button', { class: 'btn btn-primary' }, '+ New room');
  newBtn.addEventListener('click', () => openForm(null));

  return el('div', {}, [
    el('div', { class: 'd-flex justify-content-between align-items-center mb-3' }, [
      el('h1', { class: 'h3 mb-0' }, 'Manage Rooms'),
      newBtn,
    ]),
    el('div', { class: 'table-responsive' }, [
      el('table', { class: 'table table-hover align-middle' }, [
        el('thead', {}, el('tr', {}, [
          el('th', {}, 'Name'),
          el('th', { class: 'text-center' }, 'Capacity'),
          el('th', {}, 'Type'),
          el('th', {}, 'Status'),
          el('th', { class: 'text-center' }, 'Functions'),
          el('th', {}, 'Actions'),
        ])),
        tbody,
      ]),
    ]),
  ]);
}
