---
title: Lista de tareas
---

# Lista de tareas

## Descripción

`taskListWing` (nombre `tl`, atajo `K`) comparte la etiqueta (`<ul>`) con la lista con
viñetas, pero es una implementación aparte — al salir indica con
`data-nabi-list="task"` que es una lista de tareas, y con `data-nabi-checked` en cada
elemento su estado marcado.

El elemento se trae consigo mediante `parts` — no es un arreglo, es un registro.

```ts
parts: { tli: { holds: 'blocks', boolAttrs: ['ck'] } }
```

En el valor guardado, la marca es `ck` y su único valor posible es `1` — el estado
apagado no es `0`, sino **que la casilla directamente no existe.** En el HTML de salida
esto se traduce como `data-nabi-checked="true"` o `"false"`.

Al pulsar el botón, se envuelve en una lista de tareas el bloque donde está el cursor (o
los bloques que abarca la selección). Escribir `[ ] ` o `[x] ` (indiferente a
mayúsculas) al inicio de una línea da el mismo resultado, y según cuál de los dos se
haya escrito, el elemento empieza ya marcado o no. No hace falta que la línea esté
vacía, pero solo se dispara en la primera línea del párrafo.

La casilla no es un `<input>`, sino un distintivo dibujado con CSS — porque poner un
input de verdad dentro de un `contenteditable` enreda el cursor. La casilla encendida es
una equis blanca sobre una ficha de color de acento, y esa línea se atenúa y recibe una
línea horizontal.

**El lugar para marcar y desmarcar es la casilla misma** — hay que pulsar la franja
angosta al inicio del elemento (poco más ancha que un carácter) para que cambie; si se
pulsa el texto, el cursor simplemente se mueve ahí. En un texto de derecha a izquierda,
esa franja se para en el lado contrario. Esto lo lleva el wing con `attach`, así que
**no hay nada que montar aparte.**

Sangrar y quitar sangría con `Tab` y `Shift+Tab`, y terminar la lista con Enter en un
elemento vacío, funcionan igual que en la [lista con viñetas](./bullet-list).

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, taskListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings arma juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([taskListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/task-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
