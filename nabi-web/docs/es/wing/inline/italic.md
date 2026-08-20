---
title: Cursiva
---

# Cursiva

## Descripción

`italicWing` es el propietario (claim) de `<i>`. Se usa en texto que cambia de
textura, como una palabra extranjera o una cita.

- Al entrar reconoce tanto `<i>` como `<em>`; al salir los reúne en un único `<i>`.
  No conserva ningún atributo.
- El atajo del modo pista (dos pulsaciones seguidas de Shift) es `I` — se captura por
  la tecla física (`KeyI`), así que también funciona con un teclado coreano.
- Si lo pulsa con texto seleccionado, funciona como interruptor.
- Si no lo registra, a `<i>` se le arranca la cáscara y cae como texto plano.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
