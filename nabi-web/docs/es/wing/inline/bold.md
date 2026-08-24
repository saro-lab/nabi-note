---
title: Negrita
---

# Negrita

## Descripción

`boldWing` es el wing de marca en línea que gestiona el formato en negrita (`<b>`). Seleccione un texto y pulse la **B** de la barra de herramientas, aplíquelo desde el modo pista (dos pulsaciones de Shift seguidas de `B`), o use el atajo (`Ctrl`/`⌘`+`B`).

- Al entrar reconoce tanto `<b>` como `<strong>`; al salir siempre sale como la etiqueta estándar `<b>`.
- Si lo ejecuta con texto seleccionado, funciona como interruptor: si ya está en negrita lo quita, si no lo aplica.
- Si pulsa el atajo solo con el cursor, sin selección, la negrita queda reservada para el siguiente texto que escriba.
- Si no registra este wing, la etiqueta `<b>` se elimina automáticamente y solo queda el texto plano de dentro.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

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
