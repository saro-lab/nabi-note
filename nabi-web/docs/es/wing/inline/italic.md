---
title: Cursiva
description: Inclina el texto seleccionado.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Cursiva

Inclina el texto seleccionado. Aplicarlo otra vez sobre el mismo rango quita el formato, y la marca se conserva en los documentos guardados.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
