# BASK 3D — web nueva (en construcción)

Versión completa de la web de BASK 3D. Se publica en una dirección de prueba para revisarla; bask3d.com sigue mostrando la web provisional hasta el lanzamiento.

## Mientras está en pruebas

- Todas las páginas llevan `noindex, nofollow` y `robots.txt` bloquea a los buscadores.
- No lleva archivo `CNAME`: no se conecta a bask3d.com.

## Lanzamiento

1. Quitar `noindex, nofollow` de las páginas (la 404 mantiene `noindex`).
2. Sustituir `robots.txt` por el de la web actual y actualizar `sitemap.xml`.
3. Copiar los archivos al repositorio `bask-studio-web`.
