---
title: Superíndice
description: Eleva el texto seleccionado sobre la línea base.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Superíndice

Muestra el texto seleccionado en un tamaño menor por encima de la línea base. Puede usarse para exponentes o llamadas de notas al pie y solo se aplica al rango seleccionado.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
