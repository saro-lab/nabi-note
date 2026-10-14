---
title: Detalles
description: Agrupa un resumen y un cuerpo, y guarda si empieza abierto.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Detalles

Agrupa un breve resumen y un cuerpo en un solo bloque. Al crearlo desde la barra, introduce primero el resumen y continúa con el contenido debajo.

El estado de apertura definido con el triángulo se guarda en el documento y determina el estado inicial de la vista publicada. También puedes pulsar el triángulo para abrir y cerrar el bloque durante la edición.

Dentro de una celda u otro bloque, solo se abre o cierra ese bloque desplegable. Si el cursor o la selección están dentro del contenido que se cierra, se trasladan fuera; una selección situada en otro lugar se conserva.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## Estilos CSS

Da estilo al bloque con `.nabi-content details` y al título con `.nabi-content details > summary`.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

El atributo `open` representa el estado de apertura inicial guardado por el autor. CSS puede darle estilo, pero es mejor no forzar el propio estado.
