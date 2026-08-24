---
title: Subrayado
---

# Subrayado

## Descripción

`underlineWing` es el wing de marca en línea que gestiona el formato de subrayado (`<u>`).

- Reconoce la etiqueta `<u>` al entrar, y siempre sale como `<u>` estándar.
- Admite el modo de pistas (pulsar Shift dos veces seguidas y luego `U`) y el atajo de teclado (`Ctrl`/`⌘`+`U`).
- Al ejecutarlo con texto seleccionado, funciona como interruptor.
- El subrayado y el enlace (`<a>`) pueden parecerse en pantalla, pero son wings independientes — un mismo texto puede llevar subrayado y enlace a la vez.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

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
