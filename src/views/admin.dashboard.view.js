// Admin: occupancy & reservation statistics dashboard (bonus module).
import { el } from '../utils/dom.js';
import { getDashboardStats } from '../services/stats.service.js';
import { formatDate, statusColor, statusLabel } from '../utils/format.js';

function statCard(label, value, color = 'primary') {
  return el('div', { class: 'col-sm-6 col-lg-3' }, [
    el('div', { class: `card stat-card border-${color} shadow-sm h-100` }, [
      el('div', { class: 'card-body text-center' }, [
        el('div', { class: `display-6 text-${color}` }, String(value)),
        el('div', { class: 'text-secondary small text-uppercase' }, label),
      ]),
    ]),
  ]);
}

function occupancyBar(occupancy) {
  const color = occupancy >= 80 ? 'danger' : occupancy >= 50 ? 'warning' : 'success';
  return el('div', { class: 'progress', style: 'height: 18px; min-width: 120px;' }, [
    el('div', {
      class: `progress-bar bg-${color}`,
      style: `width: ${occupancy}%`,
    }, `${occupancy}%`),
  ]);
}

export async function adminDashboardView() {
  const stats = await getDashboardStats();
  const { totals, reservationsByStatus, overallOccupancy, soldSeats, totalSeats, perFunction } = stats;

  const cards = el('div', { class: 'row g-3 mb-4' }, [
    statCard('Functions', totals.functions, 'primary'),
    statCard('Active functions', totals.activeFunctions, 'success'),
    statCard('Rooms', totals.rooms, 'info'),
    statCard('Reservations', totals.reservations, 'secondary'),
  ]);

  const statusCards = el('div', { class: 'row g-3 mb-4' }, [
    statCard('Pending', reservationsByStatus.pending, 'warning'),
    statCard('Confirmed', reservationsByStatus.confirmed, 'success'),
    statCard('Cancelled', reservationsByStatus.cancelled, 'danger'),
    statCard('Overall occupancy', `${overallOccupancy}%`, 'primary'),
  ]);

  const tbody = el('tbody', {},
    perFunction.length
      ? perFunction.map((f) =>
          el('tr', {}, [
            el('td', {}, f.movie),
            el('td', {}, f.room),
            el('td', {}, `${formatDate(f.date)} · ${f.time}`),
            el('td', { class: 'text-center' }, `${f.sold}/${f.total}`),
            el('td', { style: 'min-width: 160px;' }, occupancyBar(f.occupancy)),
          ])
        )
      : [el('tr', {}, el('td', { colspan: '5', class: 'text-center text-secondary py-4' }, 'No active functions.'))]
  );

  return el('div', {}, [
    el('h1', { class: 'h3 mb-3' }, 'Dashboard'),
    cards,
    statusCards,
    el('div', { class: 'card shadow-sm' }, [
      el('div', { class: 'card-header' }, `Occupancy by function (${soldSeats}/${totalSeats} seats sold)`),
      el('div', { class: 'table-responsive' }, [
        el('table', { class: 'table table-hover align-middle mb-0' }, [
          el('thead', {}, el('tr', {}, [
            el('th', {}, 'Movie'),
            el('th', {}, 'Room'),
            el('th', {}, 'Showtime'),
            el('th', { class: 'text-center' }, 'Sold'),
            el('th', {}, 'Occupancy'),
          ])),
          tbody,
        ]),
      ]),
    ]),
  ]);
}
