const SUPABASE_URL = 'https://kowweaeczkpylzuvsrtd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_w8PxuQJjg6XB9X5I8TryOg_Tjkh7vzj';
const ADMIN_EMAIL = 'avillalbavv01@gmail.com';
const SESSION_KEY = 'arandu_admin_session';

const tabs = document.querySelectorAll('[data-auth-tab]');
const panels = document.querySelectorAll('[data-auth-panel]');

const showPanel = (name) => {
  tabs.forEach((tab) => {
    const active = tab.dataset.authTab === name;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  panels.forEach((panel) => { panel.hidden = panel.dataset.authPanel !== name; });
};

tabs.forEach((tab) => tab.addEventListener('click', () => showPanel(tab.dataset.authTab)));

const saveSession = (session) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at || Math.floor(Date.now() / 1000) + Number(session.expires_in || 3600),
    user: session.user
  }));
};

const setFormState = (form, loading, message = '', state = '') => {
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.form-status');
  button.disabled = loading;
  status.textContent = message;
  status.dataset.state = state;
};

const authRequest = async (path, body) => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.message || data.error_description || 'No se pudo completar el acceso.');
  return data;
};

document.querySelector('#login-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) return form.reportValidity();
  const data = new FormData(form);
  const email = String(data.get('email')).trim().toLowerCase();
  if (email !== ADMIN_EMAIL) return setFormState(form, false, 'Esta cuenta no está autorizada para el panel.', 'error');
  setFormState(form, true, 'Verificando acceso…');
  try {
    const session = await authRequest('token?grant_type=password', { email, password: String(data.get('password')) });
    saveSession(session);
    window.location.replace('/admin.html');
  } catch (error) {
    setFormState(form, false, error.message || 'Correo o contraseña incorrectos.', 'error');
  }
});

document.querySelector('#activate-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) return form.reportValidity();
  const data = new FormData(form);
  const email = String(data.get('email')).trim().toLowerCase();
  if (email !== ADMIN_EMAIL) return setFormState(form, false, 'La activación está limitada al correo administrativo autorizado.', 'error');
  setFormState(form, true, 'Creando acceso seguro…');
  try {
    const result = await authRequest(`signup?redirect_to=${encodeURIComponent('https://arandudevv.pages.dev/login.html')}`, { email, password: String(data.get('password')), data: { area: 'administracion' } });
    if (result.access_token) {
      saveSession(result);
      window.location.replace('/admin.html');
      return;
    }
    form.reset();
    setFormState(form, false, 'Revisá tu correo para confirmar la cuenta. Después podrás iniciar sesión.', 'success');
  } catch (error) {
    setFormState(form, false, error.message || 'No se pudo activar el acceso.', 'error');
  }
});

(async () => {
  try {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    if (fragment.get('access_token')) {
      const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${fragment.get('access_token')}` } });
      const user = await userResponse.json();
      saveSession({ access_token: fragment.get('access_token'), refresh_token: fragment.get('refresh_token'), expires_in: fragment.get('expires_in'), user });
      window.history.replaceState({}, document.title, '/login.html');
      window.location.replace('/admin.html');
    } else if (sessionStorage.getItem(SESSION_KEY)) {
      window.location.replace('/admin.html');
    }
  } catch { sessionStorage.removeItem(SESSION_KEY); }
})();
