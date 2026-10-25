---
title: Cursiva
description: Inclina el texto seleccionado.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Cursiva

Muestra el texto seleccionado en cursiva. Sirve para distinguir ligeramente del cuerpo del texto los títulos de obras o las palabras extranjeras. Vuelve a pulsar sobre un rango que ya esté en cursiva para quitar el formato.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
