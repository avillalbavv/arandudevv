(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("[data-form-status]");
  const submitButton = document.querySelector("[data-submit]");
  const submitLabel = document.querySelector("[data-submit-label]");

  const closeMenu = () => {
    menuButton?.setAttribute("aria-expanded", "false");
    menu?.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menu?.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
  document.querySelector("[data-year]").textContent = new Date().getFullYear();

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((element) => element.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -4%" });
    reveals.forEach((element) => observer.observe(element));
  }

  const setStatus = (message, state = "") => {
    status.textContent = message;
    status.dataset.state = state;
  };

  const setLoading = (loading) => {
    submitButton.disabled = loading;
    submitLabel.textContent = loading ? "Enviando…" : "Enviar consulta";
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    const fields = [...form.querySelectorAll("input:not([name='website']), textarea")];
    fields.forEach((field) => field.setAttribute("aria-invalid", String(!field.checkValidity())));
    const firstInvalid = fields.find((field) => !field.checkValidity());
    if (firstInvalid) {
      setStatus("Revisá los campos indicados antes de enviar.", "error");
      firstInvalid.focus();
      return;
    }

    const formData = new FormData(form);
    if (String(formData.get("website") || "").trim()) return;

    const config = window.ARANDU_CONFIG || {};
    if (!config.supabaseUrl || !config.supabasePublishableKey) {
      setStatus("El formulario no está disponible en este momento. Intentá nuevamente más tarde.", "error");
      return;
    }

    const payload = {
      full_name: String(formData.get("full_name")).trim(),
      email: String(formData.get("email")).trim().toLowerCase(),
      organization: String(formData.get("organization") || "").trim() || null,
      phone: String(formData.get("phone") || "").trim() || null,
      message: String(formData.get("message")).trim(),
      source: "website"
    };

    setLoading(true);
    try {
      const response = await fetch(`${config.supabaseUrl}/rest/v1/contact_requests`, {
        method: "POST",
        headers: {
          apikey: config.supabasePublishableKey,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Contact request failed: ${response.status}`);
      form.reset();
      fields.forEach((field) => field.removeAttribute("aria-invalid"));
      setStatus("Recibimos tu consulta. Nos pondremos en contacto contigo.", "success");
    } catch (error) {
      console.error("No se pudo enviar el formulario.", error);
      setStatus("No pudimos enviar tu consulta. Verificá tu conexión e intentá nuevamente.", "error");
    } finally {
      setLoading(false);
    }
  });
})();
