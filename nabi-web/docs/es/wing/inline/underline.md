---
title: Subrayado
---

# Subrayado

## Descripción

`underlineWing` es el propietario (claim) de `<u>`.

- La única etiqueta que reconoce es `<u>`. Al salir sale siempre como `<u>` y no
  conserva ningún atributo. **No acepta `<ins>`** — pierde su envoltorio y solo queda
  el texto. No es una marca que reciba también su pareja, como sí ocurre con la
  negrita (`<b>`·`<strong>`) o el tachado (`<s>`·`<strike>`·`<del>`).
- El atajo del modo pista es `U`, y el atajo de teclado es `Ctrl`/`⌘`+`U` (`mod+u`).
- Si lo pulsa con texto seleccionado, funciona como interruptor.
- Si no lo registra, a `<u>` se le arranca la cáscara y cae como texto plano.
- El subrayado y el enlace pueden solaparse en pantalla, pero son marcas distintas
  que pertenecen a wings diferentes (`a`) — un mismo texto puede llevar las dos.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
