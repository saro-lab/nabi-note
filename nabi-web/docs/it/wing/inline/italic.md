---
title: Corsivo
description: Metti in corsivo il testo selezionato.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Corsivo

Mette in corsivo il testo selezionato. Applicarlo di nuovo allo stesso intervallo rimuove la formattazione, e il mark viene conservato nei documenti salvati.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
