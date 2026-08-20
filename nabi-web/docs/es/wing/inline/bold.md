---
title: Negrita
---

# Negrita

## Descripción

`boldWing` es el propietario (claim) de `<b>`. Seleccione un texto y pulse la **B**
de la barra de herramientas, o aplíquelo desde el modo pista (dos pulsaciones
seguidas de Shift y luego `B`): ese tramo se vuelve negrita.

- Al entrar reconoce tanto `<b>` como `<strong>`; al salir sale siempre como un
  único `<b>`. No conserva ningún atributo — `class`, `style` y `data-*` se caen y
  solo queda la etiqueta.
- El atajo del modo pista es `B`, y el atajo de teclado es `Ctrl`/`⌘`+`B` (`mod+b`).
- Si lo pulsa con texto seleccionado, funciona como interruptor (`toggleMark`): si
  todo está ya en negrita lo quita, si no lo aplica. Este wing no tiene comando
  propio — el botón lleva `action: { kind: 'mark' }`, así que va directo al
  `toggleMark` del núcleo.
- Si no lo registra, a `<b>` se le arranca la cáscara y cae como texto plano (a toda
  etiqueta no registrada le pasa lo mismo — es la regla de nabi en su conjunto).

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
