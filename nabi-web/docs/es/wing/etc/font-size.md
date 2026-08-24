---
title: Tamaño del texto
---

# Tamaño del texto

## Descripción

`fontSizeWing` (id `fs`) es un **wing de marca en línea basado en valores** que ajusta el tamaño del texto (se dibuja como `<span data-nabi-size="lg">`).

Admite cuatro tamaños — `xs`, `sm`, `lg`, `xl` — y el tamaño predeterminado no es un quinto valor, sino **la ausencia misma del atributo**.

- Al pulsar el botón de la barra principal se aplica **`lg` (grande)** por defecto.
- Con el cursor dentro de una marca de tamaño, la barra contextual dinámica muestra un control deslizante (`range`) para elegir entre Predeterminado, Muy pequeño, Pequeño, Grande y Muy grande. Al mover el control a Predeterminado se quita la marca.
- Si se elige un tamaño solo con el cursor, sin texto seleccionado, se aplica a todo el párrafo.

## Ejemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
