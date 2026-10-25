---
title: Superscript
description: Raise selected text above the baseline.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Superscript

Display selected text in a smaller size above the baseline. Use it for exponents or footnote markers. It applies only to the selected range.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
