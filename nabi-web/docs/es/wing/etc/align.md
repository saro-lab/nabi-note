---
title: Alineación
---

# Alineación

## Descripción

`alignWing` (id `align`) es un wing de **atributo de párrafo** que gestiona la alineación del texto (izquierda, centro, derecha) en párrafos y elementos de bloque.

- Le da al nodo de bloque el atributo `data-nabi-align` (`<p data-nabi-align="center">`).
- **Se aplica no solo a párrafos, sino también a los encabezados (`h1`–`h6`)** (`<h2 data-nabi-align="c">`).
- Solo hay un valor de alineación a la vez. Si pulsa de nuevo el botón de alineación ya activo, el atributo se quita y se vuelve a la alineación por omisión.
- Si divide un párrafo a la mitad con Enter, ambos párrafos resultantes conservan el mismo atributo de alineación.
- **Este wing también gestiona la alineación de objetos de bloque** como imágenes, tablas y vídeos de YouTube. Como el objeto de bloque vive dentro del párrafo envoltorio (`<div data-nabi-p>`) que lo contiene, los botones de alineación de la barra de herramientas controlan la posición izquierda/derecha/centro del objeto a través de ese envoltorio.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([alignWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/align" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
