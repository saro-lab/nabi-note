---
title: Subíndice
---

# Subíndice

## Descripción

`subscriptWing` es un wing de marca en línea que gestiona el formato de subíndice (`<sub>`).
Se usa para fórmulas químicas, números de nota al pie y casos parecidos.

- Reconoce la etiqueta `<sub>` al entrar, y vuelve a salir igual.
- Se ubica en el grupo `script` de la barra de herramientas, junto al superíndice.
- Al pulsarlo con texto seleccionado, funciona como interruptor.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
