---
title: Tachado
---

# Tachado

## Descripción

`strikeWing` es el propietario (claim) de `<s>`. Se usa en valores que se han
descartado pero que conviene dejar a la vista.

- Al entrar reconoce los tres: `<s>`, `<strike>` y `<del>`; al salir sale siempre
  como `<s>`. No conserva ningún atributo — tampoco sobrevive la hora de
  `<del datetime="…">`.
- El atajo del modo pista es `S`. **No tiene tecla rápida** — a diferencia de negrita,
  cursiva y subrayado, que están en el mismo grupo `emphasis`, no lleva enganchada
  ninguna combinación con `Ctrl`/`⌘`.
- Si lo pulsa con texto seleccionado, funciona como interruptor.
- Si no se registra, `<s>` pierde su envoltorio y cae a texto plano.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, strikeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([strikeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/strikethrough" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
