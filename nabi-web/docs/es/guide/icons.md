---
title: "Temas de iconos"
description: "Usa variables CSS para sustituir iconos de wings, vista previa, pantalla completa, paneles, diferencias y ordenación de tablas. Puedes mezclar SVG, WebP y PNG; los iconos no definidos usan los archivos predeterminados."
---

# Temas de iconos

Usa variables CSS para sustituir iconos de wings, vista previa, pantalla completa, paneles, diferencias y ordenación de tablas. Puedes mezclar SVG, WebP y PNG; los iconos no definidos usan los archivos predeterminados.

## Elegir archivos

Carga el CSS y añade una clase de tema al editor o a un padre común. Las imágenes conservan sus colores, transparencia y proporciones.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

Usa rutas desde la raíz como `/icons/...` o URL HTTPS completas. No se garantiza que las rutas relativas se resuelvan junto al archivo del tema. Si alojas el CSS, copia la misma versión de `dist/icons/` junto a `nabi.css`. Si una imagen falla, el icono queda vacío, pero se mantienen el nombre, la descripción emergente y la acción del botón.

## Encontrar otros iconos

Añade `--nabi-icon-` al valor `data-nabi-icon` del elemento para obtener su variable CSS. Por ejemplo, `diff-close` usa `--nabi-icon-diff-close`. El <a href="/llms/icons.md" target="_blank" rel="noopener">contrato de iconos</a> explica las claves de contexto, menús, guardado, historial y otras, incluida la codificación de caracteres especiales.

## Modo oscuro y paneles

Cambiar la clase de tema o una variable CSS actualiza los iconos sin volver a montar. Los iconos predeterminados siguen el tema claro/oscuro. Los archivos propios no heredan `currentColor`; define variantes oscuras como arriba cuando sea necesario. Los paneles abiertos bajo `body` también siguen el tema de iconos y los cambios de clase/estilo del editor de origen. Coloca las variables en el editor o un padre común, no solo dentro de la barra.

## Mostrar botones predeterminados

`showPreview` y `showFullscreen` valen `true` por defecto. `false` elimina ese botón, su destino de foco y sus eventos. Si ambos son `false`, tampoco se crea una zona de herramientas vacía.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

Pasa las mismas opciones de visibilidad al SSR y al montaje. Para cambiar la configuración, llama a `tools.unmount()` y monta con nuevas opciones. Si no necesitas ninguno de los botones, puedes seguir omitiendo el montaje y el marcado SSR de las herramientas. Las llamadas directas a `openPreview()` y `setFullscreen()` siguen disponibles.
