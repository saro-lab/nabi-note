---
title: Lista numerada
---

# Lista numerada

## Descripción

`orderedListWing` (id `ol`, atajo `N`) es el propietario de `<ol>`. El elemento
llega junto con él mediante `parts`, así que `oli` no se registra por separado.

```ts
parts: { oli: { holds: 'blocks' } }
```

Al pulsar el botón, el bloque donde está el cursor (o los bloques que abarque la
selección) se convierte en lista numerada; al pulsarlo de nuevo, vuelve a ser un
párrafo normal. Si pulsa el botón de otra lista, cambia a ese tipo de inmediato.

Escribir `1. ` (un dígito, un punto, un espacio) al principio de un párrafo también
lo convierte automáticamente en lista numerada. El número de inicio puede ser
cualquiera y se reconoce hasta nueve cifras.

### Atajos y comportamiento de edición

- Sangrar y quitar sangría con `Tab`/`Shift+Tab`, terminar la lista con Enter en un
  elemento vacío, y fusionar con Retroceso al principio de un elemento: todo
  funciona igual que en la [lista con viñetas](./bullet-list).
- El número de cada elemento lo dibuja dinámicamente en el navegador la propia
  etiqueta HTML `<ol>`, así que al insertar o borrar un elemento en medio la
  numeración se recalcula sola.
- Las listas anidadas se renderizan de forma segura dentro de un párrafo
  envoltorio (`<div data-nabi-p>`).

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
