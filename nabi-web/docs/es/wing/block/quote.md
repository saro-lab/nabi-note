---
title: Cita
---

# Cita

## Descripción

`quoteWing` (id `quote`) gestiona el bloque de cita (`<blockquote>`). Tiene los atributos `place: 'container'` y `holds: 'blocks'`, así que además de párrafos normales puede contener otros elementos de bloque, como una tabla o una imagen.

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["texto citado"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

Al hacer clic en el botón de la barra de herramientas, los bloques seleccionados quedan envueltos en una cita. Si la selección ya es una cita, el mismo botón la deshace.

Escribe `>` seguido de un espacio al principio de un párrafo y se convierte automáticamente en cita.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
