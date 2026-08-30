---
title: Subíndice
description: Baja el texto seleccionado por debajo de la línea base.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Subíndice

Baja el texto seleccionado por debajo de la línea base, para fórmulas químicas e índices. Aplicarlo otra vez quita el formato.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
