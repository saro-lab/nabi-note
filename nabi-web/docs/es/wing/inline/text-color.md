---
title: Color del texto
---

# Color del texto

## Descripción

`textColorWing` (id `tc`) es el propietario (claim) de `<span data-color="...">`. Pertenece a la
misma rama que el resaltador: como es una marca en línea con valor, no se enciende ni se apaga,
sino que se elige un color.

- **El botón de la barra de herramientas (atajo `C`) aplica verde** — envía `setTextColor` con
  `{ c: 'green' }`. No es un botón que actúe sin argumento.
- Por eso ese botón conmuta **contra el verde**: solo se apaga cuando el rango está en verde de
  punta a punta, y un rango con otro color pasa a verde.
- Si el cursor está dentro de una marca de color de texto, en la barra contextual aparecen cinco
  muestras de color — al pulsar una, solo cambia el color allí mismo (las marcas nunca se apilan
  unas sobre otras). Este wing no tiene un campo propio de "borrar": pulsar el color ya aplicado lo
  quita, y el resto es cosa de `clearFormatWing`.
- **Con solo el cursor puesto hay dos casos.** Dentro de una marca, el objetivo es todo el texto
  que esa marca cubre; fuera de una marca queda **reservado**, y el siguiente carácter que se
  escriba sale con ese color.
- En el valor guardado solo sobrevive el nombre del color — algo como `data-color="green"`. No
  sale ningún `style` en línea. Los valores de color vienen de los tokens del núcleo `--nabi-tc-*`,
  y la hoja de estilos se comparte con el resaltador.
- Al entrar (`claim`) solo mira las etiquetas `<span>` que además lleven un atributo `data-color`.
  Un `<span>` sin `data-color` en absoluto no lo reclama este wing, así que se le quita la cáscara
  y cae a texto plano — y **si el atributo está pero su valor no figura en la lista, la cáscara se
  quita igual**, dejando solo el texto.
- Un valor guardado editado a mano con un valor fuera de la lista también es retirado por
  `repair`, cáscara y todo.
- El color de texto y el resaltador son marcas distintas, así que el mismo texto puede llevar
  ambas — por eso la hoja del resaltador nunca fija `color`.

| Nombre del color | Valor guardado |
|---|---|
| Verde | `green` |
| Coral | `coral` |
| Violeta | `violet` |
| Ámbar | `amber` |
| Azul | `blue` |

Estos cinco se exportan como `TEXT_COLORS` — un **arreglo de nombres**
(`readonly string[]`), no de valores de color.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
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
