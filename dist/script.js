const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const form = document.querySelector('#contact-form');
const status = document.querySelector('.form-status');
const submitButton = document.querySelector('[data-submit]');
const submitLabel = document.querySelector('[data-submit-label]');
const cookieBanner = document.querySelector('[data-cookie-banner]');
const cookieAccept = document.querySelector('[data-cookie-accept]');
const cookieEssential = document.querySelector('[data-cookie-essential]');

const SUPABASE_URL = 'https://kowweaeczkpylzuvsrtd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_w8PxuQJjg6XB9X5I8TryOg_Tjkh7vzj';
const COOKIE_PREFERENCE_KEY = 'arandu_cookie_preference';
const language = document.documentElement.lang.slice(0, 2);

const messages = {
  es: {
    sending: 'Enviando…',
    submit: 'Enviar consulta',
    invalid: 'Revisá los campos señalados antes de continuar.',
    success: 'Recibimos tu consulta. Nos pondremos en contacto contigo.',
    error: 'No pudimos enviar tu consulta. Verificá tu conexión e intentá nuevamente.'
  },
  en: {
    sending: 'Sending…',
    submit: 'Send inquiry',
    invalid: 'Please review the highlighted fields before continuing.',
    success: 'We received your inquiry. We will contact you shortly.',
    error: 'We could not send your inquiry. Check your connection and try again.'
  },
  pt: {
    sending: 'Enviando…',
    submit: 'Enviar consulta',
    invalid: 'Revise os campos indicados antes de continuar.',
    success: 'Recebemos sua consulta. Entraremos em contato em breve.',
    error: 'Não foi possível enviar sua consulta. Verifique sua conexão e tente novamente.'
  }
}[language] || {
  sending: 'Enviando…',
  submit: 'Enviar consulta',
  invalid: 'Revisá los campos señalados antes de continuar.',
  success: 'Recibimos tu consulta. Nos pondremos en contacto contigo.',
  error: 'No pudimos enviar tu consulta. Verificá tu conexión e intentá nuevamente.'
};

const closeMenu = () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  nav?.classList.remove('open');
};

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav?.classList.toggle('open', !open);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('click', (event) => {
  if (!nav?.classList.contains('open')) return;
  if (!nav.contains(event.target) && !menuButton?.contains(event.target)) closeMenu();
});
window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 12), { passive: true });
window.addEventListener('resize', () => { if (window.innerWidth > 1120) closeMenu(); }, { passive: true });
window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

document.querySelectorAll('.faq-list details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq-list details[open]').forEach((other) => {
      if (other !== item) other.removeAttribute('open');
    });
  });
});

const readCookiePreference = () => {
  try { return localStorage.getItem(COOKIE_PREFERENCE_KEY); }
  catch { return null; }
};

const saveCookiePreference = (value) => {
  try { localStorage.setItem(COOKIE_PREFERENCE_KEY, value); }
  catch { /* The banner still closes for this visit. */ }
  if (cookieBanner) cookieBanner.hidden = true;
};

if (cookieBanner && !readCookiePreference()) cookieBanner.hidden = false;
cookieAccept?.addEventListener('click', () => saveCookiePreference('accepted'));
cookieEssential?.addEventListener('click', () => saveCookiePreference('essential'));

const setStatus = (message, state = '') => {
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
};

const setLoading = (loading) => {
  if (submitButton) submitButton.disabled = loading;
  if (submitLabel) submitLabel.textContent = loading ? messages.sending : messages.submit;
};

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('');

  const formData = new FormData(form);
  if (String(formData.get('website') || '').trim()) return;

  const fields = [...form.querySelectorAll('input:not([name="website"]), select, textarea')];
  fields.forEach((field) => field.setAttribute('aria-invalid', String(!field.checkValidity())));
  const invalid = fields.find((field) => !field.checkValidity());

  if (invalid) {
    setStatus(messages.invalid, 'error');
    invalid.focus();
    return;
  }

  const payload = {
    full_name: String(formData.get('full_name')).trim(),
    email: String(formData.get('email')).trim().toLowerCase(),
    organization: String(formData.get('organization') || '').trim() || null,
    phone: String(formData.get('phone') || '').trim() || null,
    project_type: String(formData.get('project_type')).trim(),
    message: String(formData.get('message')).trim(),
    source: `website-${language}`
  };

  setLoading(true);
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/contact_requests`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Contact request failed: ${response.status}`);

    form.reset();
    fields.forEach((field) => field.removeAttribute('aria-invalid'));
    setStatus(messages.success, 'success');
  } catch (error) {
    console.error('No se pudo enviar el formulario.', error);
    setStatus(messages.error, 'error');
  } finally {
    setLoading(false);
  }
});

document.querySelectorAll('#year, [data-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});
