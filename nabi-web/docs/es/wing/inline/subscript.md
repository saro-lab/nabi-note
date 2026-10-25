---
title: Subíndice
description: Baja el texto seleccionado por debajo de la línea base.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Subíndice

Muestra el texto seleccionado en un tamaño menor por debajo de la línea base. Es adecuado para notaciones que necesitan subíndices, como la fórmula química `H₂O`. Este formato no añade cálculo de fórmulas; úsalo para conservar la notación en sí.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
