---
title: Letra capital
---

# Letra capital

## Descripción

`dropCapWing` es un atributo de párrafo de valor único que pega
`data-nabi-dropcap="1"` al párrafo. No crea ningún bloque nuevo: solo pone una marca
sobre un párrafo que ya existe.

- El valor es uno solo, encendido o apagado — si vuelve a pulsar el botón, el atributo
  se cae.
- **No hay ninguna opción ni variable que decida cuántas líneas abarca.** Una única
  regla `::first-letter` en la hoja de estilos del núcleo fija el tamaño —
  `font-size: 5.9em; line-height: .83`. Cuántas líneas cubra en realidad la letra lo
  decide la altura de línea de ese párrafo.
- Como lo único que toca es la primera letra, Enter trata este atributo como si fuera
  una marca — aunque parta el párrafo en dos, no se duplica a ambos lados, sino que
  sigue a esa letra.

Para cambiar el tamaño, sobrescriba esa regla.

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
