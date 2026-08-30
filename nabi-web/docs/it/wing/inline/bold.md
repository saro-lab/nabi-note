---
title: Grassetto
description: Rendi in grassetto il testo selezionato.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Grassetto

Rende in grassetto il testo selezionato. Applicarlo di nuovo allo stesso intervallo rimuove la formattazione. Il mark resta associato al testo nei documenti salvati.

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
