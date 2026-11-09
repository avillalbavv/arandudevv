# ARANDU WEB

Sitio institucional de ARANDU DEV E.A.S. UNIPERSONAL.

## Arquitectura

El sitio es HTML, CSS y JavaScript sin framework. Esta elección reduce dependencias, acelera la carga y mantiene el contenido institucional fácil de revisar. Los archivos publicados viven en `dist/`.

## Desarrollo local

```bash
python3 -m http.server 4173 --directory dist
```

Abrí `http://localhost:4173`.

## Actualización

- Textos y secciones: `dist/index.html`.
- Estilos: `dist/styles.css`.
- Interacciones: `dist/script.js`.
- Estados institucionales y datos pendientes: `content/site.json`.
- Evidencia y origen de datos: `docs/FUENTES.md`.

No actives la leyenda DNCP, IPS o WhatsApp hasta contar con una confirmación documental y autorización de publicación.

## Publicación en Cloudflare Pages

- Directorio de salida: `dist`
- Comando de compilación: ninguno
- Versión de Node: no requerida

Dominio canónico de producción: `https://www.arandudev.com/`.

## Formulario

El formulario valida la consulta y registra el mensaje en Supabase. La tabla `contact_requests` tiene Row Level Security activo: el sitio público únicamente puede insertar los campos autorizados y no puede leer, modificar ni eliminar consultas.

El acceso privado vive en `dist/login.html` y `dist/admin.html`. Solo los correos de `private.admin_allowlist` pueden leer las consultas y actualizar su estado. `administracion@arandudev.com` tiene rol `super_admin`; `avillalbavv01@gmail.com` permanece como cuenta administrativa.

## Identidad visual

La renovación conserva la arquitectura y la narrativa del sitio institucional original. Utiliza la composición monocromática oficial, Space Grotesk y Manrope, con una paleta limitada a negro, blanco y grises.
