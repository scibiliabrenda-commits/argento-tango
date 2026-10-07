# Video del hero

Colocar aquí **`hero.mp4`**: Caminito de día, colores, gente, movimiento (10–20 s en loop, sin audio).

- Fuente: <https://www.pexels.com/videos/> → buscar "Caminito", "La Boca Buenos Aires", "Buenos Aires tango", "parrilla argentina". Licencia libre, sin registro.
- **Máximo 5 MB**: 1280×720 o 1920×1080, H.264, sin pista de audio. Con ffmpeg:

  ```bash
  ffmpeg -i original.mp4 -t 15 -vf "scale=1280:-2" -c:v libx264 -crf 28 -preset slow -an -movflags +faststart hero.mp4
  ```

- Mientras no exista el archivo, se muestra el *poster* (foto de Caminito) — la página funciona igual.
- Para cambiar el poster: atributo `poster` del `<video class="hero-video">` en `index.html`.
- Con "reducir movimiento" activado en el sistema, el video no se reproduce.
