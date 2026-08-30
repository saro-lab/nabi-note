---
title: Lista numerada
description: Convierte elementos ordenados en una lista numerada.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Lista numerada

Convierte párrafos en una lista donde el orden importa. Los números se recalculan automáticamente cuando insertas, eliminas o mueves elementos. En un párrafo vacío, escribir `1.` y pulsar Espacio también crea una lista numerada.

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
