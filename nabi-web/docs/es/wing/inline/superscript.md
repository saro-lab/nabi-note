---
title: Superíndice
description: Eleva el texto seleccionado sobre la línea base.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Superíndice

Eleva el texto seleccionado sobre la línea base, para exponentes y marcas de referencia. Aplicarlo otra vez quita el formato.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
