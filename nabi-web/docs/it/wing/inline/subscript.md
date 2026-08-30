---
title: Pedice
description: Abbassa il testo selezionato sotto la baseline.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Pedice

Abbassa il testo selezionato sotto la baseline, per formule chimiche e indici. Applicarlo di nuovo rimuove la formattazione.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
