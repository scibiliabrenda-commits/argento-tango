/* ==========================================================================
   FORMULARIO B2B — validación + envío a Formspree (fetch, sin recargar)
   Reemplazar REEMPLAZAR en el atributo action del <form id="b2bForm"> (ver README).
   ========================================================================== */
(function () {
  const form = document.getElementById("b2bForm");
  if (!form) return;
  const status = document.getElementById("formStatus");
  const submit = form.querySelector('button[type="submit"]');
  const T = (k) => (window.ArgentoI18n ? ArgentoI18n.t(k) : k);
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, key) {
    const field = input.closest(".field");
    field.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
    let msg = field.querySelector(".error-msg");
    if (!msg) {
      msg = document.createElement("span");
      msg.className = "error-msg";
      msg.id = input.id + "-err";
      field.appendChild(msg);
      input.setAttribute("aria-describedby", msg.id);
    }
    msg.dataset.key = key;
    msg.textContent = T(key);
  }

  function clearError(input) {
    const field = input.closest(".field");
    field.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
    const msg = field.querySelector(".error-msg");
    if (msg) msg.remove();
  }

  function validate() {
    let ok = true;
    form.querySelectorAll("[required]").forEach((input) => {
      clearError(input);
      const v = input.value.trim();
      if (!v) { setError(input, "formRequired"); ok = false; }
      else if (input.type === "email" && !EMAIL_RE.test(v)) { setError(input, "formEmail"); ok = false; }
    });
    return ok;
  }

  function setStatus(key, cls) {
    status.dataset.key = key || "";
    status.textContent = key ? T(key) : "";
    status.className = "form-status" + (cls ? " " + cls : "");
  }

  form.addEventListener("input", (e) => {
    if (e.target.closest(".field.invalid")) clearError(e.target);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) {
      setStatus("formFix", "err");
      form.querySelector("[aria-invalid='true']")?.focus();
      return;
    }
    if (form.action.includes("REEMPLAZAR")) {
      setStatus("formConfig", "err");
      return;
    }

    const data = new FormData(form);
    // Juntar los checkboxes en una sola línea legible en el mail de Formspree
    const ops = data.getAll("operacion");
    data.delete("operacion");
    data.append("operacion", ops.join(", ") || "—");
    data.append("idioma", window.ArgentoI18n ? ArgentoI18n.lang : "es");

    submit.disabled = true;
    setStatus("formSending");
    try {
      const res = await fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      setStatus("formOk", "ok");
    } catch (err) {
      setStatus("formErr", "err");
    } finally {
      submit.disabled = false;
    }
  });

  // Re-traducir mensajes visibles al cambiar de idioma
  document.addEventListener("languagechange", () => {
    form.querySelectorAll(".error-msg").forEach((m) => (m.textContent = T(m.dataset.key)));
    if (status.dataset.key) status.textContent = T(status.dataset.key);
  });
})();
