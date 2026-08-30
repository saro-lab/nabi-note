---
title: Detalles
description: Agrupa un resumen y un cuerpo, y guarda si empieza abierto.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Detalles

Agrupa un resumen y un cuerpo que puede abrirse y cerrarse. El estado abierto se guarda con el documento, así que el lector ve el bloque como lo dejó el autor.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## Estilos CSS

Da estilo al contenedor con `.nabi-content details` y al encabezado con `.nabi-content summary`. No ocultes el `summary`, porque es el control que abre y cierra el bloque.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: 12px;
}

.article-body summary {
  cursor: pointer;
  font-weight: 700;
}
```
