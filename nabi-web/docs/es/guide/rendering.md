---
title: Configuración SSR
description: Renderiza documentos NABI TREE guardados como HTML seguro en el servidor e hidrata un editor en el navegador.
---

# Configuración SSR

En el servidor, importa solo `nabi-note/ssr`, no las superficies ni la UI de navegador. Valida el JSON de NABI TREE guardado y lo convierte en HTML publicado o en HTML de editor que se puede hidratar.

## Renderizar HTML publicado

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('The stored document could not be read.')
```

`renderStoredHtml()` valida y normaliza el JSON que recibe, y luego devuelve HTML publicado. `null` significa que el registry actual no puede leer esa entrada. Incluye el CSS del paquete y la clase `.nabi-content` en la página publicada.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

Añade `attachViewer()` de `nabi-note/viewer` en el navegador solo cuando necesites ordenación interactiva de tablas o resaltado de código. Para contenido publicado simple, basta con CSS.

## Hidratar marcado de editor pre-renderizado

Si quieres mostrar el editor desde el primer pintado, renderízalo en el servidor con `renderStoredEditorHtml()` y pasa `hydrate: true` a la superficie del navegador.

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

El servidor y el navegador deben usar el mismo documento, las mismas declaraciones de wings en el mismo orden y las mismas opciones que afectan al HTML. Inserta la salida del servidor sin cambios como hijos directos de la raíz de contenido, y no pongas `contenteditable` previamente en esa raíz. Si la estructura difiere, la superficie renderiza de nuevo el HTML de edición.

## Pre-renderizar también la barra de herramientas

`renderToolbarHtml()` y `renderViewToolsHtml()` pueden pre-renderizar controles de barra en el servidor. Al montar en el navegador, esos controles se conectan si coinciden el registry, el locale y el orden de grupos. No se admite insertar DOM arbitrario de la aplicación dentro de una raíz de barra de herramientas.

Durante SSR no uses API de navegador como `injectSheets()`. Enlaza el archivo construido `nabi-note/nabi.css` o inclúyelo en tu bundle CSS.
