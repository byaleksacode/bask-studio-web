# BASK STUDIO — web provisional

Web de BASK STUDIO (fabricación aditiva, Lasarte-Oria). Sitio estático: no necesita compilar nada.

## Archivos

- `index.html`: portada provisional.
- `quienes-somos.html`: página «Quiénes somos» (lleva `noindex` hasta publicar la web definitiva).
- `aviso-legal.html`, `privacidad.html`, `cookies.html`: páginas legales (borrador).
- `404.html`: página de error.
- `estilos.css`: estilos de todas las páginas.
- `app.js`: entrada, vídeo de portada, aviso de cookies, menú y animaciones de aparición.
- `assets/`: fotos y vídeos. `assets/fonts/`: tipografías Inter e Inter Tight (licencia SIL OFL), alojadas en la propia web.

## Publicar con GitHub Pages

Settings → Pages → Deploy from a branch → `main` / raíz.

## Pendiente antes de publicar

- Quitar `noindex` de `quienes-somos.html`.
- Poner la dirección real de LinkedIn en el enlace del pie (`id="linkedin"`).
- Rellenar los huecos marcados (`.pend`) de las tres páginas legales con los datos reales de la empresa y revisarlas con la gestoría.
- Quitar `noindex` de las páginas legales.
