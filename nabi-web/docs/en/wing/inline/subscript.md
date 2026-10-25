---
title: Subscript
description: Lower selected text below the baseline.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Subscript

Display selected text in a smaller size below the baseline. This suits notation that needs subscripts, such as the chemical formula `H₂O`. It does not add formula calculation, so use it to preserve the notation itself.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
