---
title: Usar CDN
description: Carga la versión para navegador de NABI NOTE sin una herramienta de compilación.
---

<script setup>
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
</script>

# Usar CDN

En una página estática donde no resulta práctico instalar un paquete, carga la versión para navegador y su CSS desde un CDN. La demo siguiente lee la versión del paquete al compilar el sitio y crea un editor mediante el objeto global `NabiNote`.

<CdnDemo />

## Puntos a tener en cuenta en NABI NOTE

- En código desplegado, fija la misma versión para el CSS y el JavaScript del navegador. Una URL sin versión, como `latest`, puede cambiar de comportamiento cuando se publica una nueva versión.
- El bundle del navegador expone la API raíz mediante `window.NabiNote`. `nabi-note/ssr`, `nabi-note/viewer` y `nabi-note/diff` no se publican como bundles globales separados.
- El guardado de archivos y el historial local de esta demo se ejecutan en el navegador del usuario. Envía la salida de `getJson()` a la API de tu aplicación si necesitas almacenamiento en servidor o sincronización de cuenta.
- La subida de archivos requiere el wing `upload`, una función real de subida y el wing de imagen o de enlace que corresponda. Tu servidor de subida es responsable de validar los archivos.
- La versión para navegador conecta internamente su parser HTML. `setHtml()`, abrir un archivo HTML y pegar HTML no necesitan una opción de parser ni una API privada.

La carga por CDN solo cambia la forma de cargar la biblioteca. El formato de almacenamiento y la validación de entrada son los mismos que en el paquete npm; consulta también [Uso básico](/es/guide/getting-started).
