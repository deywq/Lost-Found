import { useEffect } from 'react';

const publicRoutes = new Set(['/login', '/register']);
const protectedRoutes = new Set(['/dashboard', '/admin']);

function showMessage(form, text, isError = true) {
  let message = form.querySelector('[data-auth-message]');
  if (!message) {
    message = document.createElement('p');
    message.dataset.authMessage = 'true';
    message.setAttribute('role', 'status');
    form.prepend(message);
  }
  message.className = `mb-4 rounded-xl px-4 py-3 text-sm ${isError ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`;
  message.textContent = text;
}

export default function AuthBridge() {
  useEffect(() => {
    let active = true;
    const path = window.location.pathname.replace(/\/$/, '') || '/';

    async function checkSession() {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (!response.ok) {
          if (protectedRoutes.has(path)) window.location.assign('/login');
          return;
        }
        const { user } = await response.json();
        if (path === '/admin' && user.role !== 'admin') {
          window.location.assign('/dashboard');
          return;
        }
        if (!active) return;
        const header = document.querySelector('header > div');
        if (header && !header.querySelector('[data-auth-logout]')) {
          const button = document.createElement('button');
          button.type = 'button';
          button.dataset.authLogout = 'true';
          button.textContent = 'Log out';
          button.className = 'rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50';
          button.addEventListener('click', async () => {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
            window.location.assign('/');
          });
          header.append(button);
        }
      } catch (_error) {
        if (protectedRoutes.has(path)) window.location.assign('/login');
      }
    }

    checkSession();

    const form = publicRoutes.has(path) ? document.querySelector('main form') : null;
    if (form) {
      const inputs = [...form.querySelectorAll('input')].filter((input) => input.type !== 'checkbox');
      inputs.forEach((input) => {
        input.value = '';
        input.required = true;
      });
      const isRegistration = path === '/register';
      const emailInput = form.querySelector('input[type="email"]');
      const passwordInput = form.querySelector('input[type="password"]');
      if (emailInput) emailInput.autocomplete = 'email';
      if (passwordInput) passwordInput.autocomplete = isRegistration ? 'new-password' : 'current-password';
      if (isRegistration && passwordInput) passwordInput.minLength = 12;

      const submit = async (event) => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        if (button) button.disabled = true;
        const textInputs = inputs.filter((input) => input.type === 'text');
        const body = isRegistration
          ? {
              name: textInputs.map((input) => input.value.trim()).filter(Boolean).join(' '),
              email: emailInput?.value,
              password: passwordInput?.value,
            }
          : { email: emailInput?.value, password: passwordInput?.value };

        try {
          const response = await fetch(`/api/auth/${isRegistration ? 'register' : 'login'}`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Unable to authenticate.');
          showMessage(form, `Welcome, ${result.user.name}! Redirecting to your dashboard…`, false);
          window.setTimeout(() => window.location.assign('/dashboard'), 500);
        } catch (error) {
          showMessage(form, error.message || 'Unable to reach the server. Please try again.');
        } finally {
          if (button) button.disabled = false;
        }
      };

      form.addEventListener('submit', submit);
      return () => {
        active = false;
        form.removeEventListener('submit', submit);
      };
    }

    return () => { active = false; };
  }, []);

  return null;
}
