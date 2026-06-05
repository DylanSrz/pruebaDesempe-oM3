// Login view: validates credentials against json-server and persists the session.
import { el } from '../utils/dom.js';
import { login } from '../api/auth.api.js';
import { setSession } from '../store/session.js';
import { navigate } from '../router/router.js';
import { isEmail, required, firstError } from '../utils/validators.js';

export function loginView() {
  const errorBox = el('div', { class: 'alert alert-danger d-none' });

  const emailInput = el('input', {
    type: 'email',
    class: 'form-control',
    id: 'email',
    placeholder: 'admin@cineapp.com',
    autocomplete: 'username',
  });

  const passwordInput = el('input', {
    type: 'password',
    class: 'form-control',
    id: 'password',
    placeholder: '••••••••',
    autocomplete: 'current-password',
  });

  const submitBtn = el('button', { type: 'submit', class: 'btn btn-primary w-100' }, 'Sign in');

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove('d-none');
  }

  const form = el('form', { class: 'card-body' }, [
    errorBox,
    el('div', { class: 'mb-3' }, [
      el('label', { class: 'form-label', for: 'email' }, 'Email'),
      emailInput,
    ]),
    el('div', { class: 'mb-3' }, [
      el('label', { class: 'form-label', for: 'password' }, 'Password'),
      passwordInput,
    ]),
    submitBtn,
  ]);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.add('d-none');

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const validation = firstError([
      required(email, 'Email'),
      isEmail(email),
      required(password, 'Password'),
    ]);
    if (validation) return showError(validation);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in…';
    try {
      const user = await login(email, password);
      setSession(user);
      navigate('/catalog');
    } catch (err) {
      showError(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign in';
    }
  });

  return el('div', { class: 'login-wrapper' }, [
    el('div', { class: 'text-center mb-4' }, [
      el('h1', { class: 'h3' }, '🎬 CineApp'),
      el('p', { class: 'text-secondary' }, 'Sign in to book your tickets'),
    ]),
    el('div', { class: 'card shadow-sm' }, [form]),
    el('div', { class: 'card-body small text-secondary text-center' }, [
      el('div', {}, 'Demo users:'),
      el('div', {}, 'admin@cineapp.com / admin123'),
      el('div', {}, 'bob@cineapp.com / user123'),
    ]),
  ]);
}
