---
title: Tachado
description: Tacha el texto seleccionado.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tachado

Traza una línea por el centro del texto seleccionado. Puedes usarla para conservar a la vista expresiones modificadas o contenido que ya no es válido, sin borrarlo. Aplicarla de nuevo al mismo rango quita el formato.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
