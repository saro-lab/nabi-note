---
title: Letra capital
---

# Letra capital

## Descripción

`dropCapWing` es un wing de atributo de párrafo que muestra la primera letra del párrafo como una letra decorativa de gran tamaño (`data-nabi-dropcap="1"`).

- Funciona como un simple interruptor de encendido/apagado.
- El tamaño de la primera letra queda fijado por una regla `::first-letter` en la hoja de estilos del núcleo (`font-size: 5.9em; line-height: .83`).
- Si divide el párrafo con Enter, el atributo de letra capital no se duplica: se queda únicamente con la letra inicial original.

Para personalizar el tamaño, puede sobrescribir la siguiente regla CSS:

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings construye juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
