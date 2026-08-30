---
title: Lista con viñetas
description: Enumera varios elementos sin numerarlos.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Lista con viñetas

Convierte varios párrafos en una lista sin orden. Tab y Shift+Tab cambian la profundidad del elemento, y Enter crea el siguiente elemento. En un párrafo vacío, escribir `-` y pulsar Espacio también crea una lista con viñetas.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
