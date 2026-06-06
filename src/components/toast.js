// Lightweight toast notifications built on Bootstrap's Toast component.
import { Toast } from 'bootstrap';
import { el } from '../utils/dom.js';

/**
 * Show a toast message.
 * @param {string} message
 * @param {'success'|'danger'|'warning'|'info'} [type]
 */
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toastEl = el(
    'div',
    {
      class: `toast align-items-center text-bg-${type} border-0`,
      role: 'alert',
      'aria-live': 'assertive',
      'aria-atomic': 'true',
    },
    [
      el('div', { class: 'd-flex' }, [
        el('div', { class: 'toast-body', html: message }),
        el('button', {
          type: 'button',
          class: 'btn-close btn-close-white me-2 m-auto',
          'data-bs-dismiss': 'toast',
          'aria-label': 'Close',
        }),
      ]),
    ]
  );

  container.append(toastEl);
  const toast = new Toast(toastEl, { delay: 3500 });
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  toast.show();
}

export const toastError = (msg) => showToast(msg, 'danger');
export const toastSuccess = (msg) => showToast(msg, 'success');
