const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const form = document.querySelector('#contact-form');
const status = document.querySelector('.form-status');
const submitButton = document.querySelector('[data-submit]');
const submitLabel = document.querySelector('[data-submit-label]');

const SUPABASE_URL = 'https://kowweaeczkpylzuvsrtd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_w8PxuQJjg6XB9X5I8TryOg_Tjkh7vzj';

const closeMenu = () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  nav?.classList.remove('open');
  document.body.classList.remove('menu-open');
};

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav?.classList.toggle('open', !open);
  document.body.classList.toggle('menu-open', !open);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 12), { passive: true });
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

const setStatus = (message, state = '') => {
  status.textContent = message;
  status.dataset.state = state;
};

const setLoading = (loading) => {
  submitButton.disabled = loading;
  submitLabel.textContent = loading ? 'Enviando…' : 'Enviar consulta';
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
    setStatus('Revisá los campos señalados antes de continuar.', 'error');
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
    source: 'website'
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
    setStatus('Recibimos tu consulta. Nos pondremos en contacto contigo.', 'success');
  } catch (error) {
    console.error('No se pudo enviar el formulario.', error);
    setStatus('No pudimos enviar tu consulta. Verificá tu conexión e intentá nuevamente.', 'error');
  } finally {
    setLoading(false);
  }
});

document.querySelector('#year').textContent = String(new Date().getFullYear());
