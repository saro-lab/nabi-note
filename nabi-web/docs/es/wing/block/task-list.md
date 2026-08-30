---
title: Checklist
description: Una lista que guarda el estado de completado con el documento.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Checklist

Convierte elementos en una lista con casillas. El estado marcado o sin marcar se guarda en el documento, de modo que vuelve igual al cargarlo. En un párrafo vacío, escribir `[ ]` o `[x]` y pulsar Espacio también crea una checklist.

<WingDemo path="/wing/block/task-list" />

```ts
const selected = wings().use('tl').build()
```
