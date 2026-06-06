// Aggregations powering the admin dashboard.
import { getFunctions } from '../api/functions.api.js';
import { getReservations } from '../api/reservations.api.js';
import { getRooms } from '../api/rooms.api.js';

/**
 * Build the dashboard statistics from functions, reservations and rooms.
 * Occupancy is derived from seats sold (totalCapacity - availableSeats).
 */
export async function getDashboardStats() {
  const [functions, reservations, rooms] = await Promise.all([
    getFunctions(),
    getReservations(),
    getRooms(),
  ]);

  const reservationsByStatus = reservations.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    { pending: 0, confirmed: 0, cancelled: 0 }
  );

  const activeFunctions = functions.filter((f) => f.status === 'active');
  const totalSeats = activeFunctions.reduce((s, f) => s + f.totalCapacity, 0);
  const soldSeats = activeFunctions.reduce(
    (s, f) => s + (f.totalCapacity - f.availableSeats),
    0
  );
  const overallOccupancy = totalSeats ? Math.round((soldSeats / totalSeats) * 100) : 0;

  // Occupancy per function (only active ones), enriched with the room name.
  const perFunction = activeFunctions
    .map((f) => {
      const sold = f.totalCapacity - f.availableSeats;
      const room = rooms.find((r) => r.id === f.roomId);
      return {
        id: f.id,
        movie: f.movie,
        room: room?.name ?? `#${f.roomId}`,
        date: f.date,
        time: f.time,
        sold,
        total: f.totalCapacity,
        occupancy: f.totalCapacity ? Math.round((sold / f.totalCapacity) * 100) : 0,
      };
    })
    .sort((a, b) => b.occupancy - a.occupancy);

  return {
    totals: {
      functions: functions.length,
      activeFunctions: activeFunctions.length,
      rooms: rooms.length,
      reservations: reservations.length,
    },
    reservationsByStatus,
    overallOccupancy,
    soldSeats,
    totalSeats,
    perFunction,
  };
}
