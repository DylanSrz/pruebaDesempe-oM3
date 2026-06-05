// Formatting helpers for dates, labels and Bootstrap badges.

/** Format a date string (YYYY-MM-DD) into a readable label. */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format an ISO datetime into a readable date + time label. */
export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_STYLES = {
  // function statuses
  active: 'success',
  cancelled: 'danger',
  // reservation statuses
  pending: 'warning',
  confirmed: 'success',
  // room statuses
  inactive: 'secondary',
};

const STATUS_LABELS = {
  active: 'Active',
  cancelled: 'Cancelled',
  pending: 'Pending',
  confirmed: 'Confirmed',
  inactive: 'Inactive',
};

/** Return the Bootstrap contextual color for a given status. */
export function statusColor(status) {
  return STATUS_STYLES[status] ?? 'secondary';
}

/** Human readable status label. */
export function statusLabel(status) {
  return STATUS_LABELS[status] ?? status;
}

/** Capitalize the first letter of a string. */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
