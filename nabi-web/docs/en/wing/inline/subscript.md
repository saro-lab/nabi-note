---
title: Subscript
description: Lower selected text below the baseline.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Subscript

Lowers selected text below the baseline, for chemical formulas and indices. Applying it again removes the formatting.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
