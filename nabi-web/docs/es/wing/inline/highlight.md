---
title: Resaltador
---

# Resaltador

## Descripción

`highlightWing` es el propietario (claim) de `<mark data-color="...">`. Como es una
marca en línea que lleva un valor, no es un interruptor que se enciende y se apaga,
sino una ramificación en la que se elige un color — la misma textura que el color del
texto.

- El botón de la barra de herramientas (atajo `H`, sin argumentos) funciona como
  interruptor: si todo el tramo seleccionado ya está resaltado lo quita, y si no lo
  aplica con el color por omisión (amarillo).
- Si el cursor está dentro de una marca de resaltador, en la barra contextual
  aparecen 6 muestras de color (swatch) — al pulsar una, solo cambia el color allí
  mismo. Este wing no trae por su cuenta un botón de "borrar": borrar el formato es
  cosa de `clearFormatWing` (hay que registrarlo aparte).
- El comando también funciona si elige un color sin haber seleccionado texto, con el
  cursor puesto sin más: si el cursor ya está dentro de una marca de resaltador, el
  objetivo pasa a ser todo ese nodo de marca (no hace falta volver a seleccionar el
  tramo).
- En el valor guardado solo queda el nombre del color — algo como
  `data-color="yellow"`. No sale ningún `style` en línea: el color de fondo real no es
  cosa de este wing, sino de la hoja de estilos (CSS) del anfitrión.
- Al entrar (`claim`) solo mira la etiqueta `<mark>`: si el valor de `data-color`
  no está en la lista o falta, se aplica con el color por omisión (amarillo) — el
  sentido de "esto está resaltado" ya lo lleva la etiqueta, así que no se descarta.

| Nombre del color | Valor guardado |
|---|---|
| Amarillo | `yellow` |
| Verde | `green` |
| Celeste | `cyan` |
| Rosa | `pink` |
| Morado | `purple` |
| Naranja | `orange` |

La lista de colores también se exporta como `HIGHLIGHT_COLORS` (mapa id → valor de
color CSS).

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, highlightWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
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
