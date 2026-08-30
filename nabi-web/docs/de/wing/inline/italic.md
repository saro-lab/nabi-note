---
title: Kursiv
description: Markierten Text kursiv formatieren.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Kursiv

Formatiert den markierten Text kursiv. Wird die Formatierung erneut auf denselben Bereich angewendet, wird sie entfernt, und die Markierung in gespeicherten Dokumenten bleibt erhalten.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
