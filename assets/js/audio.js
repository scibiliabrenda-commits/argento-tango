/* ==========================================================================
   AUDIO día / noche con crossfade guiado por --night-progress + capa de brasas
   - Autoplay DESACTIVADO: suena solo después de que el usuario toca el botón de música.
   - En ese toque arrancan LAS DOS pistas (día y noche). Los celulares (sobre todo
     iPhone) solo permiten iniciar audio durante un toque del usuario: si la de noche
     arrancara recién en el atardecer, el navegador la bloquearía.
   - El volumen de cada pista pasa por un GainNode (Web Audio API), porque en iPhone
     el volumen de un <audio> no se puede cambiar desde la página.
     Día = 1 - progreso, noche = progreso (curva de potencia constante).
   ========================================================================== */
(function () {
  const MAX_VOL = 0.6;

  // AUDIO DÍA — tango/folklore festivo en /assets/audio/dia.mp3
  const dia = document.getElementById("audioDia");
  // AUDIO NOCHE — tango arrabalero con contrabajo en /assets/audio/noche.mp3
  const noche = document.getElementById("audioNoche");
  const btn = document.getElementById("audioToggle");
  if (!dia || !noche || !btn) return;

  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  let gainDia = null, gainNoche = null;   // null = sin Web Audio (se usa .volume)

  let enabled = false;
  let progress = 0;      // último --night-progress recibido
  let master = 0;        // fade general al activar/desactivar (0..1)
  let fadeTimer = null;

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

  /* ── Mezclador (se crea dentro del primer toque) ── */
  function setupMixer() {
    if (ctx || !AC) return;
    try {
      ctx = new AC();
      gainDia = ctx.createGain();
      gainNoche = ctx.createGain();
      gainDia.gain.value = 0;
      gainNoche.gain.value = 0;
      // (conexiones separadas: Safari viejo no encadena .connect())
      ctx.createMediaElementSource(dia).connect(gainDia);
      ctx.createMediaElementSource(noche).connect(gainNoche);
      gainDia.connect(ctx.destination);
      gainNoche.connect(ctx.destination);
    } catch (err) {
      // Navegador sin soporte: se vuelve al control por .volume
      gainDia = gainNoche = null;
    }
  }

  // Curva de potencia constante para que el cruce no "baje" a la mitad
  const curveDay = (p) => Math.cos(p * Math.PI / 2);
  const curveNight = (p) => Math.sin(p * Math.PI / 2);

  function setLevel(el, gain, value) {
    value = Math.max(0, Math.min(1, value));
    if (gain) gain.gain.setTargetAtTime(value, ctx.currentTime, 0.05);
    else el.volume = value;
  }

  function applyVolumes() {
    setLevel(dia, gainDia, curveDay(progress) * MAX_VOL * master);
    setLevel(noche, gainNoche, curveNight(progress) * MAX_VOL * master);
  }

  function fadeMaster(target, ms = 900) {
    clearInterval(fadeTimer);
    const from = master, start = performance.now();
    // setInterval (y no requestAnimationFrame) para que el fade termine aunque la pestaña no pinte
    fadeTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - start) / ms);
      master = from + (target - from) * k;
      applyVolumes();
      if (k >= 1) {
        clearInterval(fadeTimer);
        if (target === 0) { dia.pause(); noche.pause(); }
      }
    }, 30);
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
    if (ctx && ctx.state === "suspended") ctx.resume();
    try {
      // Las dos pistas arrancan en este mismo toque; el volumen decide cuál se escucha
      await Promise.all([dia.play(), noche.play()]);
      say("audioOn");
    } catch (err) {
      enabled = false;
      dia.pause(); noche.pause();
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
     El buffer en loop pasa por un GainNode cuyo volumen sube cuando la sección
     #brasa está en pantalla y baja al salir. Archivo: /assets/audio/brasas.mp3
     (sonido de brasas crepitantes de Pixabay, "crackling fire embers", 10-30 s) */
  const BRASA_SRC = "assets/audio/brasas.mp3";
  const BRASA_VOL = 0.45;
  const brasaSection = document.getElementById("brasa");
  let brasaGain = null, brasaLoading = null;
  let brasaInView = false;

  function initBrasas() {
    if (!ctx || brasaLoading) return brasaLoading;
    brasaGain = ctx.createGain();
    brasaGain.gain.value = 0;
    brasaGain.connect(ctx.destination);
    brasaLoading = fetch(BRASA_SRC)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then((data) => new Promise((ok, fail) => ctx.decodeAudioData(data, ok, fail)))
      .then((buffer) => {
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        src.connect(brasaGain);
        src.start();
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
    if (enabled) { disable(); return; }
    setupMixer();
    initBrasas();
    enable();
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

  // Al cambiar de app/pestaña se pausa todo; al volver se retoma
  document.addEventListener("visibilitychange", () => {
    if (!enabled) return;
    if (document.hidden) {
      dia.pause(); noche.pause();
      if (ctx) ctx.suspend();
    } else {
      if (ctx) ctx.resume();
      Promise.all([dia.play(), noche.play()]).then(applyVolumes).catch(() => {
        // Si el celular no deja retomar sin un toque, se muestra el botón apagado
        enabled = false; master = 0; setUI();
      });
    }
    updateBrasas();
  });
})();
