// Reusable Bootstrap modal helper for forms and confirmations.
import { Modal } from 'bootstrap';
import { el } from '../utils/dom.js';

/**
 * Open a modal with custom body content and a primary action.
 * @param {Object} opts
 * @param {string} opts.title
 * @param {Node|string} opts.body - DOM node or HTML string for the modal body.
 * @param {string} [opts.confirmText]
 * @param {string} [opts.confirmClass]
 * @param {() => (boolean|Promise<boolean>)} [opts.onConfirm] - return false to keep the modal open.
 * @returns {{ modal: Modal, element: HTMLElement }}
 */
export function openModal({
  title,
  body,
  confirmText = 'Save',
  confirmClass = 'btn-primary',
  onConfirm,
}) {
  const bodyNode = typeof body === 'string' ? el('div', { html: body }) : body;

  const confirmBtn = el(
    'button',
    { type: 'button', class: `btn ${confirmClass}` },
    confirmText
  );

  const element = el(
    'div',
    { class: 'modal fade', tabindex: '-1' },
    [
      el('div', { class: 'modal-dialog modal-dialog-centered' }, [
        el('div', { class: 'modal-content' }, [
          el('div', { class: 'modal-header' }, [
            el('h5', { class: 'modal-title' }, title),
            el('button', {
              type: 'button',
              class: 'btn-close',
              'data-bs-dismiss': 'modal',
              'aria-label': 'Close',
            }),
          ]),
          el('div', { class: 'modal-body' }, [bodyNode]),
          el('div', { class: 'modal-footer' }, [
            el('button', {
              type: 'button',
              class: 'btn btn-secondary',
              'data-bs-dismiss': 'modal',
            }, 'Cancel'),
            confirmBtn,
          ]),
        ]),
      ]),
    ]
  );

  document.body.append(element);
  const modal = new Modal(element);

  confirmBtn.addEventListener('click', async () => {
    if (!onConfirm) return modal.hide();
    confirmBtn.disabled = true;
    try {
      const keepOpen = (await onConfirm()) === false;
      if (!keepOpen) modal.hide();
    } finally {
      confirmBtn.disabled = false;
    }
  });

  element.addEventListener('hidden.bs.modal', () => element.remove());
  modal.show();

  return { modal, element };
}

/** Convenience confirmation dialog returning a promise<boolean>. */
export function confirmDialog({ title = 'Confirm', message, confirmText = 'Confirm', confirmClass = 'btn-danger' }) {
  return new Promise((resolve) => {
    let confirmed = false;
    const { element } = openModal({
      title,
      body: el('p', { class: 'mb-0' }, message),
      confirmText,
      confirmClass,
      onConfirm: () => {
        confirmed = true;
      },
    });
    element.addEventListener('hidden.bs.modal', () => resolve(confirmed));
  });
}
