/* ==========================================================================
   MAIN — idioma, día→noche (--night-progress), reveals, parallax, footer
   ========================================================================== */
(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1. Idioma ─────────────────────────────────────────────────────────── */
  document.querySelectorAll(".lang-switch button[data-lang]").forEach((btn) =>
    btn.addEventListener("click", () => ArgentoI18n.switchLanguage(btn.dataset.lang))
  );
  ArgentoI18n.switchLanguage(ArgentoI18n.detectLanguage());

  /* ── 2. Día → Noche ────────────────────────────────────────────────────
     La sección #atardecer es alta (320vh) con un escenario sticky de 100vh.
     progreso = cuánto se recorrió de esa sección (0 al entrar, 1 al salir).
     Antes de la sección vale 0 (día), después vale 1 (noche): un único valor
     controla colores, cielo, ventanas encendidas, brasas y el crossfade de audio.
     Intersection Observer activa el cálculo solo cuando la sección está cerca,
     así el scroll del resto de la página no hace trabajo extra.            */
  const dusk = document.getElementById("atardecer");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  let last = -1;
  let ticking = false;
  let duskActive = false;

  function computeProgress() {
    const rect = dusk.getBoundingClientRect();
    const travel = rect.height - window.innerHeight;     // distancia recorrible con el sticky fijo
    const p = travel > 0 ? -rect.top / travel : (rect.top < 0 ? 1 : 0);
    return Math.min(1, Math.max(0, p));
  }

  function setProgress(p) {
    p = Math.round(p * 1000) / 1000;
    if (p === last) return;
    last = p;
    root.style.setProperty("--night-progress", p);
    root.classList.toggle("is-night", p >= 0.5);
    if (themeMeta) themeMeta.setAttribute("content", p >= 0.5 ? "#0d0d0d" : "#87CEEB");
    document.dispatchEvent(new CustomEvent("nightprogress", { detail: { progress: p } }));
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      // Cerca de la sección: cálculo continuo. Lejos: igual se recalcula (es barato y
      // setProgress no hace nada si el valor no cambió) para cubrir saltos que la
      // atraviesan de golpe sin que el observer llegue a marcarla (anclas, Inicio/Fin).
      if (duskActive || last !== (computeProgress() >= 0.5 ? 1 : 0)) setProgress(computeProgress());
      if (!reduceMotion) parallax();
    });
  }

  if (dusk) {
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          duskActive = entry.isIntersecting;
          // Al salir de la sección, fijar 0 o 1 según el lado por el que salió
          setProgress(computeProgress());
        });
      },
      { rootMargin: "50% 0px 50% 0px" }
    ).observe(dusk);
    setProgress(computeProgress());
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ── 2b. Luciérnagas del atardecer ───────────────────────────────────────
     Nacen abajo de la pantalla y, a medida que avanza --night-progress, suben
     y se acomodan en un óvalo alrededor del texto "Cuando cae la noche...".
     Cada una arranca un poco más tarde (--d) para que lleguen de a una.     */
  const flyBox = document.getElementById("fireflies");
  const FLY_COUNT = window.innerWidth < 768 ? 22 : 34;
  function placeFireflies() {
    if (!flyBox) return;
    const w = flyBox.clientWidth || window.innerWidth;
    const h = flyBox.clientHeight || window.innerHeight;
    const text = document.querySelector(".dusk-text");
    const tw = text ? text.offsetWidth : w * 0.6;
    const th = text ? text.offsetHeight : h * 0.25;
    const rx = Math.min(w * 0.46, tw / 2 + 70);
    const ry = Math.min(h * 0.42, th / 2 + 60);
    const cx = w / 2, cy = h / 2;
    if (!flyBox.children.length) {
      for (let i = 0; i < FLY_COUNT; i++) flyBox.appendChild(document.createElement("span")).appendChild(document.createElement("i"));
    }
    [...flyBox.children].forEach((fly, i) => {
      const r = (n) => { const x = Math.sin((i + 1) * 9301 + n * 49297) * 233280; return x - Math.floor(x); }; // pseudoaleatorio estable
      const a = (i / FLY_COUNT) * Math.PI * 2 + r(1) * 0.35;
      const k = 0.85 + r(2) * 0.35;                      // algunas un poco más afuera
      fly.className = "fly";
      fly.style.cssText = [
        `--sx:${(r(3) * w).toFixed(0)}px`, `--sy:${(h + 20 + r(4) * h * 0.4).toFixed(0)}px`,
        `--tx:${(cx + Math.cos(a) * rx * k).toFixed(0)}px`, `--ty:${(cy + Math.sin(a) * ry * k).toFixed(0)}px`,
        `--d:${(0.08 + r(5) * 0.37).toFixed(3)}`, `--span:${(0.35 + r(6) * 0.15).toFixed(3)}`,
        `--s:${(3 + r(7) * 4).toFixed(1)}px`, `--f:${(2.2 + r(8) * 2.5).toFixed(2)}s`, `--fd:${(-r(9) * 3).toFixed(2)}s`,
      ].join(";");
    });
  }
  placeFireflies();
  window.addEventListener("resize", () => { clearTimeout(placeFireflies.t); placeFireflies.t = setTimeout(placeFireflies, 200); });
  document.addEventListener("languagechange", placeFireflies);

  /* ── 3. Parallax (Historia) ────────────────────────────────────────────── */
  const parallaxEls = [...document.querySelectorAll("[data-speed]")];
  function parallax() {
    const vh = window.innerHeight;
    parallaxEls.forEach((el) => {
      const host = el.closest("section") || el;
      const r = host.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed);
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
  }
  if (!reduceMotion) parallax();

  /* ── 4. Entradas de sección ────────────────────────────────────────────── */
  const revealIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); revealIO.unobserve(e.target); }
    }),
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal, .stagger").forEach((el) => revealIO.observe(el));

  /* ── 5. Video del hero: si no existe el archivo, queda el poster ────────── */
  const video = document.querySelector(".hero-video");
  if (video) {
    // El video es ambiental (mudo, 10 s en loop): se reproduce siempre, también con
    // "reducir movimiento" activado en el sistema, porque es la imagen principal del sitio.
    video.muted = true;
    video.play().catch(() => { /* sin autoplay (ahorro de datos, etc.): queda el poster */ });
    video.querySelector("source")?.addEventListener("error", () => video.classList.add("no-video"));
  }

  /* ── 6. Footer: tagline (4 s) y frase final (5 s) rotando en los 3 idiomas */
  const langs = ["es", "en", "pt"];
  function rotate(el, key, ms) {
    if (!el) return;
    let i = 0;
    const paint = () => { el.textContent = ArgentoI18n.t(key, langs[i]); el.lang = langs[i]; };
    paint();
    if (reduceMotion) return;
    setInterval(() => {
      el.style.opacity = 0;
      setTimeout(() => { i = (i + 1) % langs.length; paint(); el.style.opacity = 1; }, 600);
    }, ms);
  }
  rotate(document.getElementById("taglineRotator"), "heroTagline", 4000);
  rotate(document.getElementById("phraseRotator"), "phrase", 5000);

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
