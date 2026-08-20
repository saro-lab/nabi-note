---
title: Color del texto
---

# Color del texto

## Descripción

`textColorWing` es el propietario (claim) de `<span data-color="...">`. Pertenece a la
misma rama que el resaltador: como es una marca en línea con valor, no se enciende ni
se apaga, sino que se elige un color.

- El botón de la barra de herramientas (atajo `C`, sin argumentos) funciona como
  interruptor.
- Si el cursor está dentro de una marca de color del texto, en la barra contextual
  aparecen 5 muestras de color (swatch) — al pulsar una, solo cambia el color allí
  mismo (las marcas no se apilan unas sobre otras). Este wing no trae por su cuenta un
  botón de "borrar": eso es cosa de `clearFormatWing`.
- Aunque solo tenga el cursor puesto y elija un color, si el cursor ya está dentro de
  una marca de color del texto, el objetivo pasa a ser todo ese nodo de marca.
- En el valor guardado solo queda el nombre del color — algo como
  `data-color="green"`. No sale ningún `style` en línea.
- Al entrar (`claim`) solo mira los `<span>` que además tengan el atributo
  `data-color`: un `<span>` sin `data-color` no lo reclama este wing, de modo que se le
  arranca la cáscara y cae como texto plano. Si el atributo está pero su valor no
  figura en la lista de abajo, se aplica con el color por omisión (verde) — la misma
  regla que en el resaltador: la etiqueta ya lleva el sentido de "texto con color", así
  que no se descarta.
- El resaltador y este son marcas distintas, así que pueden aplicarse juntos al mismo
  texto.

| Nombre del color | Valor guardado |
|---|---|
| Verde | `green` |
| Coral | `coral` |
| Violeta | `violet` |
| Ámbar | `amber` |
| Azul | `blue` |

La lista de colores también se exporta como `TEXT_COLORS` (mapa id → valor de color
CSS).

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([textColorWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/text-color" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
