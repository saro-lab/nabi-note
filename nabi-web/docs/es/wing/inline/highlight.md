---
title: Resaltador
---

# Resaltador

## Descripción

`highlightWing` (nombre `hl`) es el propietario (claim) de `<mark data-color="...">`. Es una marca en línea que lleva un valor, así que no es un interruptor de encendido/apagado, sino una elección entre colores — la misma lógica que el color de texto.

- **El botón de la barra de herramientas (atajo `H`) aplica amarillo** — envía `setHighlight` con `{ c: 'yellow' }`. No es un botón sin argumentos.
- Por eso el botón actúa como **interruptor respecto al amarillo**. Solo se quita cuando el tramo está en amarillo **de punta a punta** — si se pulsa sobre un tramo que es todo verde, el verde se sustituye por amarillo en lugar de quitarse, y hace falta una segunda pulsación para quitarlo.
- Cuando el cursor está dentro de una marca de resaltador, aparecen seis muestras de color en la barra contextual — al pulsar una, solo cambia el color, en el sitio. Este wing no tiene un campo propio de "quitar": pulsar de nuevo el color ya aplicado lo quita, y borrar el formato es cosa de `clearFormatWing` (hay que registrarlo aparte).
- **Con solo el cursor hay dos casos.** Si el cursor ya está dentro de una marca de resaltador, el texto que cubre esa marca es el objetivo (no hace falta volver a seleccionar el tramo). Fuera de una marca no hay texto sobre el que aplicarlo, así que queda **reservado** — el siguiente carácter que se escriba sale con ese color.
- En el valor guardado solo sobrevive el nombre del color — algo como `data-color="yellow"`. No sale ningún `style` en línea. El fondo lo dibuja la hoja que este wing lleva en `styles` (una hoja compartida con el color de texto), y los valores de color en sí vienen de los tokens del núcleo `--nabi-hl-*`, que el anfitrión puede sobrescribir.
- **Un valor fuera de la lista nunca sobrevive en ningún sitio.** El comando se niega a ejecutarse, y al entrar, un `<mark>` que lleve un `data-color` que no esté en la lista se despoja de su envoltura y deja **solo el texto**. Un `<mark>` sin `data-color` sigue el mismo camino — el color *es* el valor, así que un resaltado sin él no tiene dónde sostenerse.
- Un valor guardado editado a mano se trata igual: `repair` encuentra un valor fuera de la lista y retira el nodo entero, envoltura incluida.

| Color | Valor guardado |
|---|---|
| Amarillo | `yellow` |
| Verde | `green` |
| Cian | `cyan` |
| Rosa | `pink` |
| Morado | `purple` |
| Naranja | `orange` |

Estos seis se exportan como `HIGHLIGHT_COLORS` — un **array de nombres**
(`readonly string[]`), no de valores de color. Los valores viven en la hoja de estilos.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, highlightWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es el `registry`
const { nabi, registry } = createNabiWith([highlightWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/highlight" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
