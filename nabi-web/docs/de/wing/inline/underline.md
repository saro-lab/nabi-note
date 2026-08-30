---
title: Unterstreichung
description: Ausgewählten Text unterstreichen.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Unterstreichung

Unterstreicht den ausgewählten Text. Wird sie erneut auf denselben Bereich angewendet, wird die Formatierung entfernt, und die Markierung in gespeicherten Dokumenten bleibt erhalten.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
