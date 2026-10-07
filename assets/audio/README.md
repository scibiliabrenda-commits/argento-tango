# Audio

Colocar aquí tres archivos (no vienen incluidos):

| Archivo | Cuándo suena | Carácter |
|---|---|---|
| `dia.mp3` | Mitad superior (DÍA) | Tango / folklore luminoso, festivo, alegre |
| `noche.mp3` | Desde el atardecer (NOCHE) | Tango arrabalero, grave, contrabajo prominente, bandoneón |
| `brasas.mp3` | Mientras se ve la sección "Argento los espera" | Brasas crepitantes, 10–30 s en loop. Pixabay: "crackling fire embers". Se mezcla suave encima de la música (no la reemplaza) |

- Formato MP3, 128 kbps, idealmente < 3 MB. Que el final empalme con el principio (se reproducen en loop).
- El visitante los activa con el botón de música (abajo a la izquierda). El cruce día ↔ noche es automático según el scroll (`assets/js/audio.js`, volumen máximo en `MAX_VOL`).
- Si falta `dia.mp3`/`noche.mp3`, el botón muestra "Falta el archivo de audio". Si falta `brasas.mp3`, simplemente no suena el crepitar.
- Volumen de las brasas: `BRASA_VOL` en `audio.js`.

Fuentes libres de derechos:
- Pixabay Music: <https://pixabay.com/music/search/tango/>
- Free Music Archive: <https://freemusicarchive.org/search?quicksearch=tango> (ver licencia de cada tema)

Recortar/convertir: <https://audiotrimmer.com> o Audacity.
