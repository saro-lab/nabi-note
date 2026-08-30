---
title: Durchgestrichen
description: Markierten Text durchstreichen.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Durchgestrichen

Durchstreicht den markierten Text. Wird die Formatierung erneut auf denselben Bereich angewendet, wird sie entfernt, und die Markierung bleibt in gespeicherten Dokumenten erhalten.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
