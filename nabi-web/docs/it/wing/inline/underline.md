---
title: Sottolineato
description: Sottolinea il testo selezionato.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Sottolineato

Sottolinea il testo selezionato. Applicarlo di nuovo allo stesso intervallo rimuove la formattazione, e il mark viene conservato nei documenti salvati.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
