---
title: Subrayado
description: Subraya el texto seleccionado.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Subrayado

Subraya el texto seleccionado. Aplicarlo otra vez sobre el mismo rango quita el formato, y la marca se conserva en los documentos guardados.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
