---
title: Apice
description: Solleva il testo selezionato sopra la baseline.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Apice

Solleva il testo selezionato sopra la baseline, per esponenti e indicatori di riferimento. Applicarlo di nuovo rimuove la formattazione.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
