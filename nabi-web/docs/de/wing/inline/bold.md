---
title: Fett
description: Den ausgewählten Text fett formatieren.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Fett

Macht den ausgewählten Text fett. Wird die Formatierung erneut auf denselben Bereich angewendet, wird sie entfernt. Die Markierung bleibt im gespeicherten Dokument mit dem Text verbunden.

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
