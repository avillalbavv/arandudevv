# ARANDU DEV

Sitio institucional oficial de ARANDU DEV — Tecnología con propósito.

## Estructura

- Sitio estático compatible con Cloudflare Pages.
- Formulario conectado a Supabase mediante una clave publicable.
- Tabla `contact_requests` protegida con Row Level Security.
- Diseño responsive, navegación accesible y preferencias de movimiento reducido.

## Desarrollo local

Servir la carpeta raíz con cualquier servidor HTTP estático, por ejemplo:

```bash
npx serve .
```

No abras `index.html` directamente con `file://`, ya que las políticas del navegador pueden impedir las solicitudes del formulario.

## Despliegue

El directorio de salida es la raíz del repositorio. No requiere comando de compilación. La rama `main` se publica automáticamente en Cloudflare Pages.

## Base de datos

La migración reproducible se encuentra en `supabase/migrations/`.
