---
title: Cursiva
---

# Cursiva

## Descripción

`italicWing` es el wing de marca en línea que aplica el formato de cursiva (`<i>`). Se
usa para distinguir el tono del texto: énfasis, palabras extranjeras y similares.

- Al entrar reconoce tanto `<i>` como `<em>`; al salir siempre se convierte en la
  etiqueta estándar `<i>`.
- Admite el modo de pista (doble pulsación de Shift y luego `I`) y el atajo
  `Ctrl`/`⌘`+`I`.
- Ejecutarlo con texto seleccionado actúa como interruptor (toggle).

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
