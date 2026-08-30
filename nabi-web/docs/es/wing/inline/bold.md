---
title: Negrita
description: Muestra el texto seleccionado en negrita.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Negrita

Pone en negrita el texto seleccionado. Aplicarlo otra vez sobre el mismo rango quita el formato. La marca se conserva con el texto en los documentos guardados.

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
