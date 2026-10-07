# Argento Tango Experience — Landing page

Landing cinematográfica para **Argento Parrilla a Leña** (Caminito, La Boca, Buenos Aires).
Una sola página con dos personalidades: **día** (almuerzo + show) y **noche** (paseo por Caminito + cena tango show), unidas por un atardecer animado con el scroll.

- 100 % estático: HTML + CSS + JavaScript vanilla. Sin build, sin dependencias, sin backend.
- Idiomas: Español / English / Português (se recuerda la elección del visitante).
- Reservas por WhatsApp (+54 9 11 2732-7601) · Formulario B2B para agencias vía Formspree.

---

## 1. Ver el sitio y publicarlo

### Verlo en tu compu
Cualquier servidor estático sirve. Con Python:

```bash
python -m http.server 5173
```

y abrir <http://localhost:5173>. (Abrir `index.html` con doble click también funciona, salvo el video y el audio en algunos navegadores.)

### Publicar
| Opción | Pasos |
|---|---|
| **GitHub Pages** | Subir el repo a GitHub → *Settings → Pages* → Source: `Deploy from a branch`, rama `main`, carpeta `/ (root)` → Save. En 1–2 min queda en `https://USUARIO.github.io/argento-tango/`. |
| **Netlify** | <https://app.netlify.com/drop> → arrastrar la carpeta `argento-tango`. Listo. (O conectar el repo de GitHub: sin comando de build, carpeta de publicación `/`.) |
| **Vercel** | <https://vercel.com/new> → importar el repo → Framework preset: **Other** → Deploy. |

Para usar dominio propio (ej. `argentotango.com`), configurarlo en el panel del servicio elegido y luego actualizar el dominio en `index.html` (canonical / og:url / JSON-LD), `sitemap.xml` y `robots.txt`.

---

## 2. Checklist antes de lanzar

| # | Qué | Dónde |
|---|---|---|
| 1 | **Reseñas**: hoy muestra datos reales de Google (4.7 · 2.060 opiniones, oct 2026) y 3 reseñas reales copiadas. Actualizar cada tanto a mano, o conectar Places API (sección 4). | `index.html` sección `#resenas` |
| 3 | **Formspree**: configurado (formulario "argento colaboradores"). Ver sección 3 para cambiarlo. | `index.html` |
| 7 | **Fotos**: reemplazar las de ejemplo por fotos propias (ver `assets/images/README.md`). | `index.html` |
| 8 | **Video del hero**: `assets/video/hero.mp4` (ver `assets/video/README.md`). | — |
| 9 | **Audio**: `assets/audio/dia.mp3`, `assets/audio/noche.mp3` y `assets/audio/brasas.mp3` (sección 5). | — |
| 10 | **Dominio** en canonical, og:url, JSON-LD, `sitemap.xml`, `robots.txt`. | — |
| 11 | **Fecha del show** en el JSON-LD (`startDate`) cuando haya fechas confirmadas. | `<head>` de `index.html` |
| 12 | Probar el WhatsApp desde un celular. | — |

WhatsApp: todos los botones usan
`https://wa.me/5491127327601?text=Quiero%20reservar%20mi%20lugar%20en%20Argento`
(buscar `wa.me` en `index.html` para cambiar número o mensaje; los espacios del mensaje se escriben `%20`).

---

## 3. Formspree (formulario de agencias)

1. Crear una cuenta gratis en <https://formspree.io> (plan Free: 50 envíos/mes).
2. **+ New Form** → nombre "Argento – Socios" → email donde querés recibir las solicitudes.
3. Formspree muestra un endpoint del tipo `https://formspree.io/f/abcdwxyz`. Copiá el código final (`abcdwxyz`).
4. En `index.html` (línea ~542) reemplazar:
   ```html
   action="https://formspree.io/f/REEMPLAZAR"
   ```
   por
   ```html
   action="https://formspree.io/f/abcdwxyz"
   ```
5. Publicar y enviar una solicitud de prueba. La primera vez Formspree pide confirmar el email.

Mientras el `action` diga `REEMPLAZAR`, el formulario valida los campos pero muestra "Formulario sin configurar" en vez de enviar.
Incluye anti-spam (campo oculto `_gotcha`), validación de obligatorios y email, y mensajes en el idioma elegido.

---

## 4. Reseñas reales (Google Places API)

1. Entrar a <https://console.cloud.google.com> → crear proyecto → **APIs & Services → Library** → activar **Places API (New)**.
2. **Credentials → Create credentials → API key**. Restringirla: *HTTP referrers* = tu dominio, *API restrictions* = Places API (New).
3. Buscar el **Place ID** del restaurante: <https://developers.google.com/maps/documentation/places/web-service/place-id>.
4. En `index.html`, dentro de `#resenas`, hay un snippet comentado (`Google Places API (implementación futura)`). Descomentarlo y completar `PLACE_ID` y `API_KEY`. Reemplaza las cards de ejemplo por las reseñas reales (Google devuelve hasta 5).
5. Borrar el aviso `placeholder-note` y actualizar `.rating-badge` con `rating` y `userRatingCount`.

> La API key queda visible en el navegador: por eso es obligatorio restringirla por dominio. Alternativa sin código: widgets de Elfsight / Trustindex.

---

## 5. Audio (día y noche)

El botón de música (abajo a la izquierda) activa la música. **No hay autoplay** (los navegadores lo bloquean y molesta).
Al pasar por el atardecer, el tango diurno baja y el nocturno sube (crossfade controlado por el scroll, en `assets/js/audio.js`).

Colocar tres archivos MP3 (idealmente < 3 MB cada uno, 128 kbps, en loop limpio):

- `assets/audio/dia.mp3` — tango / folklore luminoso y festivo
- `assets/audio/noche.mp3` — tango arrabalero, grave, con contrabajo y bandoneón
- `assets/audio/brasas.mp3` — sonido de brasas crepitantes, 10–30 s en loop. Pixabay: buscar **"crackling fire embers"**. Se mezcla suave por encima de la música (Web Audio API + GainNode) solo mientras la sección de la brasa está en pantalla y si el visitante ya activó el audio.

Fuentes libres de derechos:
- **Pixabay Music** — <https://pixabay.com/music/search/tango/> (licencia libre, sin atribución obligatoria).
- **Free Music Archive** — <https://freemusicarchive.org/search?quicksearch=tango> (revisar la licencia de cada tema: CC BY exige citar al autor).
- Búsquedas útiles: "tango", "tango arrabalero", "milonga", "bandoneon", "argentine folk", "chacarera".

---

## 6. Video del hero

Ver `assets/video/README.md`. Fuente sugerida: **Pexels Videos** — <https://www.pexels.com/videos/> (buscar "Caminito", "La Boca Buenos Aires", "Buenos Aires tango", "parrilla argentina"). Comprimir a < 5 MB.

---

## 7. Cambiar precios de los menús

En `index.html`, cada precio tiene un comentario `<!-- PRECIO ... -->` justo arriba:

| Menú | Línea | Código |
|---|---|---|
| Almuerzo (Menú Argento Mediodía) | **200** | `<span class="cur">USD</span> 50` |
| Cena — Tira de asado | **318** | `<span class="cur">USD</span> 80` |
| Cena — Vacío a la estaca | **338** | `<span class="cur">USD</span> 120` |
| Cena — Premium | **358** | `<span class="cur">USD</span> 180` |

Cambiar solo el número. Actualizar también los `price` de las `offers` del JSON-LD en el `<head>` (para Google) y `priceRange`.
Los nombres de platos y textos están en `assets/js/i18n.js` (una vez por idioma: `es`, `en`, `pt`).

---

## 8. Mapa

El mapa marca **Caminito** (no una dirección puntual): la dirección exacta se le envía al cliente con la confirmación de la reserva, porque puede variar según almuerzo, cena o clima. Para cambiar lo que marca, editar `q=Caminito,%20La%20Boca,%20Buenos%20Aires` en el `src` del `<iframe>` de la sección `#llegar`.

Los traslados se informan en "Indicaciones": puerta a puerta desde el hotel o punto de encuentro, confirmado al reservar (textos `dirTransfer` en `assets/js/i18n.js`).

## 9. Estructura

```
argento-tango/
├── index.html               # Toda la página (HTML semántico, SEO, JSON-LD)
├── sitemap.xml · robots.txt
└── assets/
    ├── css/
    │   ├── styles.css       # Variables --day-* / --night-*, --night-progress, secciones
    │   ├── animations.css   # Brasas, llamas, reveals, keyframes
    │   └── components.css   # Botones, cards, reseñas, form, footer
    ├── js/
    │   ├── i18n.js          # Traducciones ES/EN/PT + switchLanguage()
    │   ├── main.js          # Día→noche, parallax, reveals, footer
    │   ├── audio.js         # Crossfade día/noche + capa de brasas (Web Audio API)
    │   └── form.js          # Validación + envío Formspree
    ├── images/README.md · audio/README.md · video/README.md
```

### Cómo funciona el día → noche
La sección `#atardecer` mide 320vh y tiene un escenario `position: sticky` con una **foto real de la calle empedrada de Caminito**. `main.js` calcula cuánto se recorrió (0 → 1) y lo escribe en la variable CSS `--night-progress` del `<html>`. Antes de esa sección vale 0, después vale 1. Todo lo demás es CSS que lee esa variable: la misma foto pasa de `saturate(1.2)` (mediodía) a `saturate(0.3)` + `brightness` bajo, con un tinte cálido de atardecer a mitad de camino y un overlay oscuro de noche encima; además aparecen las brasas, los textos, cambia la UI y se cruza el volumen de cada pista de audio. Un Intersection Observer marca cuándo la sección está cerca.

Para cambiar la foto del atardecer: `.dusk-photo` en `assets/css/styles.css`. La foto de las brasas: `.brasa-img` (mismo archivo).

### Texto sobre fondos claros
En Hero, Historia y Almuerzo todos los títulos llevan `text-shadow: 0 2px 12px rgba(0,0,0,.45), 0 1px 3px rgba(0,0,0,.3)` y el cuerpo `0 1px 8px rgba(0,0,0,.35)` (regla `.zone-day` en `styles.css`). El logo con degradado usa la misma sombra como `drop-shadow`, porque `text-shadow` ensucia el degradado.

Compatibilidad: Chrome/Edge 111+, Safari 16.2+ (iOS incluido), Firefox 113+ (usa `color-mix()`). Respeta `prefers-reduced-motion`.

---

## 10. Créditos de las fotos de ejemplo

Fotos tomadas de **Wikimedia Commons** (cargadas por URL, no incluidas en el repo). Son licencias libres (en su mayoría CC BY / CC BY-SA): si se mantienen en producción hay que citar autor y licencia. Ver cada ficha:

- [Caminito Buenos Aires Argentina](https://commons.wikimedia.org/wiki/File:Caminito_Buenos_Aires_Argentina.jpg) — fondo del atardecer
- [Embers 01](https://commons.wikimedia.org/wiki/File:Embers_01.JPG) — separador de la brasa
- [Buenos Aires – La Boca – Caminito – 200807i](https://commons.wikimedia.org/wiki/File:Buenos_Aires_-_La_Boca_-_Caminito_-_200807i.jpg)
- [Caminito Farolito](https://commons.wikimedia.org/wiki/File:Caminito_Farolito.jpg)
- [Calle Caminito in La Boca](https://commons.wikimedia.org/wiki/File:Calle_Caminito_in_La_Boca,_Buenos_Aires-2.JPG)
- [La Boca Corner Of Nostalgia And Tango](https://commons.wikimedia.org/wiki/File:La_Boca_Corner_Of_Nostalgia_And_Tango_(247462367).jpeg)
- [Tango Argentino Buenos Aires Performance 2011](https://commons.wikimedia.org/wiki/File:Tango_Argentino_Buenos_Aires_Performance_2011.jpg)
- [Argentina – Buenos Aires 060 – tango show](https://commons.wikimedia.org/wiki/File:Argentina_-_Buenos_Aires_060_-_tango_show_(6979621857).jpg)
- [Asado argentino a la estaca (con brasas)](https://commons.wikimedia.org/wiki/File:Asado_argentino_a_la_estaca_(con_brasas).jpg)
- [Asado tradicional argentino, leña, brasas](https://commons.wikimedia.org/wiki/File:Asado_tradicional_argentino,_le%C3%B1a,_brasas.jpg)

**Recomendación:** reemplazarlas por fotos propias de Argento (la parrilla, el salón, los bailarines reales). Convierten mucho mejor y evitan atribuciones.
