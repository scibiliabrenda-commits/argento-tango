/* ==========================================================================
   AUDIO día / noche con crossfade guiado por --night-progress
   - Autoplay DESACTIVADO: suena solo después de que el usuario toca el botón de música.
   - El volumen de cada pista sigue al scroll: día = 1 - progreso, noche = progreso.
   ========================================================================== */
(function () {
  const MAX_VOL = 0.6;

  // AUDIO DÍA — REEMPLAZAR: colocar tango/folklore festivo en /assets/audio/dia.mp3
  const dia = document.getElementById("audioDia");
  // AUDIO NOCHE — REEMPLAZAR: colocar tango arrabalero con contrabajo en /assets/audio/noche.mp3
  const noche = document.getElementById("audioNoche");
  const btn = document.getElementById("audioToggle");
  if (!dia || !noche || !btn) return;

  let enabled = false;
  let progress = 0;      // último --night-progress recibido
  let master = 0;        // fade general al activar/desactivar (0..1)
  let raf = null;

  const toast = document.createElement("div");
  toast.className = "audio-toast";
  toast.setAttribute("role", "status");
  document.body.appendChild(toast);
  let toastTimer;
  function say(key) {
    toast.textContent = window.ArgentoI18n ? ArgentoI18n.t(key) : key;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  // Curva de potencia constante para que el cruce no "baje" a la mitad
  const curveDay = (p) => Math.cos(p * Math.PI / 2);
  const curveNight = (p) => Math.sin(p * Math.PI / 2);

  function applyVolumes() {
    dia.volume = Math.max(0, Math.min(1, curveDay(progress) * MAX_VOL * master));
    noche.volume = Math.max(0, Math.min(1, curveNight(progress) * MAX_VOL * master));
    // Pausar la pista inaudible ahorra batería en mobile
    if (enabled) {
      if (dia.volume > 0.005 && dia.paused) dia.play().catch(() => {});
      if (noche.volume > 0.005 && noche.paused) noche.play().catch(() => {});
      if (dia.volume <= 0.005 && !dia.paused) dia.pause();
      if (noche.volume <= 0.005 && !noche.paused) noche.pause();
    }
  }

  function fadeMaster(target, ms = 900) {
    cancelAnimationFrame(raf);
    const from = master, start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / ms);
      master = from + (target - from) * k;
      applyVolumes();
      if (k < 1) raf = requestAnimationFrame(step);
      else if (target === 0) { dia.pause(); noche.pause(); }
    };
    raf = requestAnimationFrame(step);
  }

  function setUI() {
    btn.setAttribute("aria-pressed", String(enabled));
    btn.setAttribute("aria-label", window.ArgentoI18n ? ArgentoI18n.t(enabled ? "audioLabelOn" : "audioLabelOff") : "");
    updateBrasas();
  }

  async function enable() {
    enabled = true;
    master = 0;
    applyVolumes();
    const track = progress < 0.5 ? dia : noche;
    try {
      await track.play();
      say("audioOn");
    } catch (err) {
      enabled = false;
      say("audioMissing");
      setUI();
      return;
    }
    setUI();
    fadeMaster(1);
  }

  function disable() {
    enabled = false;
    setUI();
    say("audioOff");
    fadeMaster(0, 500);
  }

  /* ── BRASAS: capa extra que se mezcla con la música (no la reemplaza) ──────
     Web Audio API: el buffer en loop pasa por un GainNode cuyo volumen sube
     cuando la sección #brasa está en pantalla y baja al salir.
     // REEMPLAZAR: descargar sonido de brasas crepitantes desde Pixabay (buscar "crackling fire embers") — archivo corto de 10-30s en loop
     Archivo: /assets/audio/brasas.mp3                                          */
  const BRASA_SRC = "assets/audio/brasas.mp3";
  const BRASA_VOL = 0.45;
  const brasaSection = document.getElementById("brasa");
  let ctx = null, brasaGain = null, brasaSource = null, brasaLoading = null;
  let brasaInView = false;

  function initBrasas() {
    // Se crea dentro del click del usuario (requisito de autoplay de los navegadores)
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || brasaLoading) return brasaLoading;
    ctx = new AC();
    brasaGain = ctx.createGain();
    brasaGain.gain.value = 0;
    brasaGain.connect(ctx.destination);
    brasaLoading = fetch(BRASA_SRC)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then((data) => new Promise((ok, fail) => ctx.decodeAudioData(data, ok, fail)))
      .then((buffer) => {
        brasaSource = ctx.createBufferSource();
        brasaSource.buffer = buffer;
        brasaSource.loop = true;
        brasaSource.connect(brasaGain);
        brasaSource.start();
        updateBrasas();
      })
      .catch(() => { /* sin brasas.mp3: la página sigue igual, solo sin crepitar */ });
    return brasaLoading;
  }

  function updateBrasas() {
    if (!ctx || !brasaGain) return;
    const target = enabled && brasaInView && !document.hidden ? BRASA_VOL : 0;
    if (target > 0 && ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    brasaGain.gain.cancelScheduledValues(now);
    brasaGain.gain.setValueAtTime(brasaGain.gain.value, now);
    brasaGain.gain.linearRampToValueAtTime(target, now + (target ? 1.5 : 1));
  }

  if (brasaSection) {
    new IntersectionObserver(([entry]) => {
      brasaInView = entry.isIntersecting;
      updateBrasas();
    }, { threshold: 0.35 }).observe(brasaSection);
  }

  btn.addEventListener("click", () => {
    if (enabled) disable();
    else { initBrasas(); enable(); }
  });
  [dia, noche].forEach((a) => a.addEventListener("error", () => {
    if (enabled) { say("audioMissing"); }
  }));

  // main.js emite este evento cada vez que cambia --night-progress
  document.addEventListener("nightprogress", (e) => {
    progress = e.detail.progress;
    if (enabled) applyVolumes();
  });
  document.addEventListener("languagechange", setUI);
  document.addEventListener("visibilitychange", () => {
    if (!enabled) return;
    if (document.hidden) { dia.pause(); noche.pause(); } else applyVolumes();
    updateBrasas();
  });
})();
