---
title: Bloque plegable
---

# Bloque plegable

## Descripción

`detailsWing` (id `details`, atajo `D`) gestiona el bloque plegable tipo acordeón (`<details>` +
`<summary>`). La línea de resumen (`<summary>`) viene incorporada mediante el atributo `parts`,
así que no hace falta registrarla por separado.

```ts
parts: { summary: { holds: 'inline' } }
```

Al pulsar el botón de la barra de herramientas, los bloques que toca el cursor quedan envueltos en
un bloque plegable, con una línea de resumen vacía creada en la parte superior. Si pulsa Enter en
la línea de resumen, pasa al área de contenido del cuerpo (dentro de la línea de resumen un salto
de línea nunca la divide).

**La pantalla de edición también se dibuja exactamente como quedará guardado.** Un bloque guardado
plegado (sin `open`) se carga plegado también en el editor, y al hacer clic en el icono de flecha
de la izquierda se puede desplegar o plegar en cualquier momento (ese clic cambia de inmediato el
atributo `o` del nabi-tree). Si el cursor estaba dentro del cuerpo al plegar el bloque, se mueve de
forma segura fuera de él.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, detailsWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([detailsWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/details" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
