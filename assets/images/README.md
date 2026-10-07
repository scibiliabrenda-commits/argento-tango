# Imágenes

Hoy la página carga fotos de ejemplo desde Wikimedia Commons (ver créditos en el README principal).
Para usar fotos propias:

1. Guardarlas en esta carpeta en **JPG o WebP**, ~1600 px de ancho para fondos y ~1200 px para la foto del show, < 300 KB cada una (comprimir en <https://squoosh.app>).
2. Nombres sugeridos:

| Archivo | Se usa en | Qué foto |
|---|---|---|
| `historia.jpg` | Fondo parallax de "La Historia" (`.parallax-bg`, atributo `style="--img:url(...)"`) | Fachadas de Caminito |
| `almuerzo.jpg` | Fondo del Almuerzo | Caminito de día / mesas al sol |
| `atardecer.jpg` | Transición día → noche (`.dusk-photo` en `styles.css`) | La calle empedrada de Caminito con sus fachadas, de día (el CSS la oscurece solo) |
| `caminito-noche.jpg` | Fondo del Paseo nocturno | Caminito iluminado de noche |
| `brasas.jpg` | Separador "Argento los espera" (`.brasa-img` en `styles.css`) | Primer plano de brasas / leña ardiendo, sin márgenes |
| `parrilla.jpg` | Fondo de la Cena | Parrilla / brasas |
| `show.jpg` | Imagen del Show | Pareja de tango en escenario |
| `llegar.jpg` | Fondo de "Cómo llegar" | Vista de La Boca |
| `og.jpg` (1200×630) | Vista previa al compartir en redes (`og:image`) | La mejor foto |

3. En `index.html` reemplazar la URL `https://commons.wikimedia.org/...` por la ruta local, por ejemplo
   `style="--img:url('assets/images/historia.jpg')"` o `src="assets/images/show.jpg"`.
   Para `atardecer.jpg` y `brasas.jpg`, cambiar la `url(...)` en `assets/css/styles.css` por `url('../images/atardecer.jpg')`.
4. Escribir un `alt` descriptivo en cada `<img>` (accesibilidad y SEO).

Fuentes libres alternativas: <https://www.pexels.com> (buscar "La Boca Buenos Aires colorful", "Argentine asado grill fire", "tango dancers Buenos Aires", "Caminito street colorful cobblestone Buenos Aires", "burning charcoal embers close up").
