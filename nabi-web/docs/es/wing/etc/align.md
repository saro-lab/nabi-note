---
title: Alineación
---

# Alineación

## Descripción

Un **único** `alignWing` (id `align`) lleva a la vez la izquierda, el centro y la
derecha. En la barra de herramientas es una constante — no hay una fábrica `align()`
que las agrupe: cada valor tiene su propio botón. Le pega al bloque el atributo
`data-nabi-align`.

- Es un **atributo de bloque** que deja la etiqueta como está y solo añade el
  atributo. Como en `<p data-nabi-align="center">`, el párrafo en sí no cambia.
- **Se aplica a párrafos y a encabezados.** También vale
  `<h2 data-nabi-align="c">` — porque un encabezado es una línea de texto como
  cualquier otra. De los cuatro atributos de párrafo, solo la alineación se comporta
  así; el tamaño del texto, la tipografía y la letra capital siguen siendo exclusivos
  del párrafo.
- Solo hay un valor a la vez — si tiene puesta la alineación a la izquierda y pulsa
  centrar, la izquierda se cae y entra el centro. Si vuelve a pulsar el valor que ya
  está puesto, el atributo se cae entero (se vuelve a la alineación por omisión).
- **Enter transmite la alineación tal cual a ambos lados.** Si parte un párrafo, los
  dos salen con la misma alineación — a diferencia del encabezado (`h`), que se cae en
  el lado vacío, o de la letra capital (`dc`), que solo sigue a un lado, la alineación
  no tiene esa excepción.
- Los tres son **tres botones** de un mismo wing (`buttons`) — no se pueden activar o
  desactivar por separado; solo se mete `alignWing` en el arreglo de wings.
- **También fija dónde se colocan la tabla, la imagen y YouTube.** El objeto vive
  dentro del párrafo envoltorio que lo contiene, y es ese párrafo el que lleva la
  alineación, así que "una imagen centrada" es en realidad "una imagen dentro de un
  párrafo centrado". Por eso la barra contextual de la imagen y de la tabla no tiene
  ninguna casilla de alineación, y solo la alineación no desaparece de la barra de
  herramientas aunque el cursor esté sobre el objeto.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
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
