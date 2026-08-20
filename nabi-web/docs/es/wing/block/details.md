---
title: Bloque plegable
---

# Bloque plegable

## Descripción

`detailsWing` (id `details`, atajo `D`) posee la caja plegable (`<details>` +
`<summary>`). La línea de resumen se trae junto con él mediante `parts`, así que no se
registra aparte — no es un arreglo, es un registro.

```ts
parts: { summary: { holds: 'inline' } }
```

Al pulsar el botón, los bloques que abarque el cursor quedan envueltos en una nueva
caja plegable, con una línea de resumen vacía al frente. Si pulsa Enter en la línea de
resumen, pasa al contenido (la línea de resumen en sí no se parte).

**El editor dibuja siempre la forma que se va a guardar.** Una caja guardada plegada
también se ve plegada en el editor, y al pulsar el triángulo se pliega o despliega ahí
mismo — esa pulsación cambia directamente el valor guardado (`o`). Si el cursor estaba
dentro al plegarla, sale fuera de la caja.

::: tip No hay barra contextual
Antes había dos botones: **Guardar abierto** y **Guardar plegado**. En la época en que
la pantalla siempre se dibujaba desplegada, esa era la única forma de decir con cuál de
las dos se iba a guardar. Ahora que la pantalla dibuja exactamente el valor guardado y
el triángulo lo cambia, decir lo mismo dos veces sobraba, así que se retiró.
:::

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
