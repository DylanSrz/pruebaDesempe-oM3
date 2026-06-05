// Business rules for reservations. This layer enforces the domain constraints
// and keeps the function's `availableSeats` in sync with reservation changes.
import { getFunction, patchFunction } from '../api/functions.api.js';
import {
  createReservation,
  patchReservation,
  getReservation,
} from '../api/reservations.api.js';

/** Returns true when the function's first showtime is already in the past. */
export function hasStarted(fn) {
  const start = new Date(`${fn.date}T${fn.time || '00:00'}`);
  return start.getTime() <= Date.now();
}

/**
 * Create a reservation, enforcing all the business rules and decrementing
 * the function's available seats atomically (best-effort, sequential).
 */
export async function bookTickets({ userId, functionId, tickets }) {
  const fn = await getFunction(functionId);

  if (fn.status === 'cancelled') {
    throw new Error('This function has been cancelled and cannot receive new reservations.');
  }
  if (hasStarted(fn)) {
    throw new Error('This function has already started.');
  }
  if (tickets > fn.availableSeats) {
    throw new Error(`Only ${fn.availableSeats} seat(s) available.`);
  }

  const reservation = await createReservation({
    userId,
    functionId,
    tickets,
    reservationDate: new Date().toISOString(),
    status: 'pending',
  });

  await patchFunction(functionId, { availableSeats: fn.availableSeats - tickets });
  return reservation;
}

/**
 * Update the ticket count of an existing (active) reservation, adjusting the
 * function seats by the delta. Enforces the "active reservation" rule for users.
 * @param {object} opts
 * @param {object} opts.reservation - current reservation record.
 * @param {number} opts.tickets - new ticket count.
 * @param {boolean} [opts.isAdmin] - admins may edit any reservation.
 */
export async function changeTickets({ reservation, tickets, isAdmin = false }) {
  if (reservation.status === 'cancelled') {
    throw new Error('Cancelled reservations cannot be modified.');
  }

  const fn = await getFunction(reservation.functionId);
  if (!isAdmin && hasStarted(fn)) {
    throw new Error('The function has already started; this reservation can no longer be modified.');
  }

  const delta = tickets - reservation.tickets; // seats to subtract from availability
  if (delta > fn.availableSeats) {
    throw new Error(`Only ${fn.availableSeats} additional seat(s) available.`);
  }

  await patchReservation(reservation.id, { tickets });
  await patchFunction(reservation.functionId, {
    availableSeats: fn.availableSeats - delta,
  });
}

/**
 * Cancel a reservation and return its seats to the function.
 * Cancelled reservations cannot be reactivated, so we no-op if already cancelled.
 */
export async function cancelReservation(reservationId) {
  const reservation = await getReservation(reservationId);
  if (reservation.status === 'cancelled') {
    throw new Error('This reservation is already cancelled.');
  }

  await patchReservation(reservationId, { status: 'cancelled' });

  const fn = await getFunction(reservation.functionId);
  await patchFunction(reservation.functionId, {
    availableSeats: fn.availableSeats + reservation.tickets,
  });
}

/** Admin action: set a reservation status (e.g. approve -> confirmed). */
export async function setReservationStatus(reservationId, status) {
  const reservation = await getReservation(reservationId);

  // When moving an active reservation to cancelled, give the seats back.
  if (status === 'cancelled' && reservation.status !== 'cancelled') {
    return cancelReservation(reservationId);
  }
  if (reservation.status === 'cancelled') {
    throw new Error('Cancelled reservations cannot be reactivated.');
  }

  await patchReservation(reservationId, { status });
}
