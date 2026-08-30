---
title: Barrato
description: Barra il testo selezionato.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Barrato

Barra il testo selezionato. Applicarlo di nuovo allo stesso intervallo rimuove la formattazione, e il mark viene conservato nei documenti salvati.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
