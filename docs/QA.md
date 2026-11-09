# Control de calidad

## Funcional

- Navegación por anclas y retorno al inicio.
- Menú móvil con apertura, cierre por enlace y cierre con Escape.
- Formulario con validación nativa, mensajes accesibles, campo trampa y envío real a Supabase.
- Enlaces externos con `noopener noreferrer`.

## Accesibilidad

- HTML semántico, enlace para saltar al contenido, jerarquía de encabezados y etiquetas de formulario.
- Foco visible y estados `aria-expanded`, `aria-invalid` y `aria-live`.
- Contraste compatible con WCAG 2.2 AA en texto y controles principales.
- Animaciones anuladas mediante `prefers-reduced-motion`.

## Técnica

- Sitio estático sin secretos ni dependencias de ejecución. La clave publicable de Supabase se protege mediante RLS.
- Metadatos descriptivos y Open Graph, `robots.txt`, `sitemap.xml` y página 404.
- Imágenes con dimensiones, texto alternativo y carga diferida en el portafolio.
- Contenido institucional actualizable desde `content/site.json` y HTML editorial.

## Base de datos

- Tabla `contact_requests` con RLS activo.
- Acceso público limitado a INSERT sobre columnas específicas.
- Sin políticas públicas de lectura, actualización o eliminación.
- Migraciones reproducibles guardadas en `supabase/migrations/`.
