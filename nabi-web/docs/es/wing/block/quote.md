---
title: Cita
---

# Cita

## Descripción

`quoteWing` (id `quote`) posee la caja de cita (`<blockquote>`). Tiene `place:
'container'` y `holds: 'blocks'` — dentro viven bloques. Como cualquier otro objeto, la
propia cita lleva un párrafo envoltorio y se sitúa en el primer nivel.

**No fija `allows`.** El interior de la cita sigue las mismas reglas que el primer
nivel, así que una tabla o una imagen también pueden entrar envueltas en su propio
párrafo — si se pega o se importa un HTML con esa forma, sobrevive tal cual.

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["texto"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

Sin embargo, **el botón de insertar no entra dentro de la cita.** Cosas que se colocan
con `insertLump`, como la imagen, la tabla o el separador, siempre se sitúan en el
**primer nivel**, así que aunque el cursor esté dentro de la cita, el objeto nuevo se
sitúa **detrás** de ella. Para meterlo dentro de la cita, hay que pegarlo.

Al pulsar el botón, todos los bloques de primer nivel que abarque la selección quedan
envueltos en una cita. Solo se deshace si todo lo abarcado **ya es cita** — si hay una
mezcla, se envuelve una vez más entero.

Escribir `>` y un espacio en una línea vacía también convierte esa línea en cita — en
esta conversión automática **el disparador es el espacio** (no Enter), porque se sigue
escribiendo en la misma línea.

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
