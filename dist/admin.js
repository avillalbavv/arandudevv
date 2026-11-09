const SUPABASE_URL = 'https://kowweaeczkpylzuvsrtd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_w8PxuQJjg6XB9X5I8TryOg_Tjkh7vzj';
const ADMIN_EMAILS = ['avillalbavv01@gmail.com', 'administracion@arandudev.com'];
const SUPER_ADMIN_EMAIL = 'administracion@arandudev.com';
const SESSION_KEY = 'arandu_admin_session';
let requests = [];

const getSession = () => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; } };
const clearSession = () => { sessionStorage.removeItem(SESSION_KEY); window.location.replace('/login.html'); };

const refreshSession = async (session) => {
  if (!session?.refresh_token) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST', headers: { apikey: SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: session.refresh_token })
  });
  if (!response.ok) return null;
  const next = await response.json();
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  return next;
};

const authenticatedFetch = async (path, options = {}) => {
  let session = getSession();
  if (!session) return clearSession();
  if (Number(session.expires_at || 0) < Math.floor(Date.now() / 1000) + 30) session = await refreshSession(session);
  if (!session) return clearSession();
  const headers = { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${session.access_token}`, ...options.headers };
  let response = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers });
  if (response.status === 401) {
    session = await refreshSession(session);
    if (!session) return clearSession();
    response = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers: { ...headers, Authorization: `Bearer ${session.access_token}` } });
  }
  return response;
};

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
const formatDate = (value) => new Intl.DateTimeFormat('es-PY', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

const renderStats = () => {
  document.querySelector('[data-stat="total"]').textContent = requests.length;
  ['new', 'contacted', 'closed'].forEach((status) => { document.querySelector(`[data-stat="${status}"]`).textContent = requests.filter((item) => item.status === status).length; });
};

const renderInbox = () => {
  const inbox = document.querySelector('[data-inbox]');
  const filter = document.querySelector('[data-filter]').value;
  const visible = filter === 'all' ? requests : requests.filter((item) => item.status === filter);
  if (!visible.length) { inbox.innerHTML = '<div class="empty-state"><strong>No hay consultas en esta vista.</strong><p>Los nuevos mensajes enviados desde el sitio aparecerán aquí.</p></div>'; return; }
  inbox.innerHTML = visible.map((item) => `
    <article class="message-card" data-request-id="${item.id}">
      <header><div><span class="status-badge status-${escapeHtml(item.status)}">${escapeHtml(item.status)}</span><time datetime="${escapeHtml(item.created_at)}">${formatDate(item.created_at)}</time></div><strong>${escapeHtml(item.project_type || 'Consulta general')}</strong></header>
      <div class="message-grid"><div><h2>${escapeHtml(item.full_name)}</h2><a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a>${item.phone ? `<a href="tel:${escapeHtml(item.phone)}">${escapeHtml(item.phone)}</a>` : ''}${item.organization ? `<p>${escapeHtml(item.organization)}</p>` : ''}</div><p class="message-body">${escapeHtml(item.message)}</p></div>
      <footer><label>Estado<select data-status><option value="new" ${item.status === 'new' ? 'selected' : ''}>Nueva</option><option value="contacted" ${item.status === 'contacted' ? 'selected' : ''}>Contactada</option><option value="closed" ${item.status === 'closed' ? 'selected' : ''}>Cerrada</option><option value="spam" ${item.status === 'spam' ? 'selected' : ''}>Spam</option></select></label></footer>
    </article>`).join('');
};

const loadRequests = async () => {
  const status = document.querySelector('.admin-status');
  status.textContent = 'Actualizando bandeja…';
  try {
    const response = await authenticatedFetch('/rest/v1/contact_requests?select=id,full_name,email,organization,phone,project_type,message,status,created_at&order=created_at.desc');
    if (!response?.ok) throw new Error('No fue posible leer las consultas.');
    requests = await response.json();
    renderStats(); renderInbox(); status.textContent = `${requests.length} consulta${requests.length === 1 ? '' : 's'} cargada${requests.length === 1 ? '' : 's'}.`;
  } catch (error) { status.textContent = error.message; }
};

document.querySelector('[data-filter]')?.addEventListener('change', renderInbox);
document.querySelector('[data-refresh]')?.addEventListener('click', loadRequests);
document.querySelector('[data-inbox]')?.addEventListener('change', async (event) => {
  if (!event.target.matches('[data-status]')) return;
  const card = event.target.closest('[data-request-id]');
  const id = Number(card.dataset.requestId);
  const value = event.target.value;
  event.target.disabled = true;
  const response = await authenticatedFetch(`/rest/v1/contact_requests?id=eq.${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ status: value }) });
  event.target.disabled = false;
  if (!response?.ok) { document.querySelector('.admin-status').textContent = 'No se pudo actualizar el estado.'; return; }
  requests = requests.map((item) => item.id === id ? { ...item, status: value } : item);
  renderStats(); renderInbox();
});

document.querySelector('[data-logout]')?.addEventListener('click', async () => {
  const session = getSession();
  if (session?.access_token) await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: 'POST', headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${session.access_token}` } }).catch(() => {});
  clearSession();
});

(async () => {
  const session = getSession();
  if (!session) return clearSession();
  const response = await authenticatedFetch('/auth/v1/user');
  if (!response?.ok) return clearSession();
  const user = await response.json();
  const email = String(user.email || '').toLowerCase();
  if (!ADMIN_EMAILS.includes(email)) return clearSession();
  document.querySelector('[data-admin-email]').textContent = user.email;
  document.querySelector('[data-admin-role]').textContent = email === SUPER_ADMIN_EMAIL ? 'Superadministrador' : 'Administrador';
  loadRequests();
})();
