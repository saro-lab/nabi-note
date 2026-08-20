---
title: Lista numerada
---

# Lista numerada

## Descripción

`orderedListWing` (id `ol`, atajo `N`) es el propietario de `<ol>`. Los elementos se
traen junto con él mediante `parts`, así que `oli` no se registra aparte — no es un
arreglo, es un registro.

```ts
parts: { oli: { holds: 'blocks' } }
```

Al pulsar el botón, el bloque donde está el cursor (o los bloques que abarque la
selección) queda envuelto en una lista numerada; al pulsarlo de nuevo, se deshace. Si
pulsa el botón de otra lista, cambia a ese tipo.

Escribir al principio de una línea uno o más dígitos, un punto y un espacio (`1. `,
etc.) da el mismo resultado. **Vale cualquier número como inicio, pero como máximo
nueve cifras** (`1234567890. ` no se activa), y si tras el punto viene algo más, como
en `1.2 `, tampoco se activa. No hace falta que la línea esté vacía — solo se mide el
principio de línea antes del cursor, y solo se activa en la primera línea del párrafo.

- Sangrar y quitar sangría con `Tab` y `Shift+Tab`, terminar la lista con Enter en un
  elemento vacío, y fusionar con Retroceso al principio de un elemento: todo funciona
  igual que en la [lista con viñetas](./bullet-list).
- El número no entra en el valor guardado — lo dibuja `<ol>`, así que al insertar o
  borrar elementos el navegador vuelve a numerar por su cuenta.
- El anidamiento también es marcado real y queda tal cual en el valor guardado. Como
  el elemento contiene bloques, el texto lleva un párrafo puesto encima y una lista
  anidada va dentro de un párrafo envoltorio.
- Atributos como `start` o `type` no sobreviven, así que una lista que entre con
  `start="5"` vuelve a contar desde uno.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
