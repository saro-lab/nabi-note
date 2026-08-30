---
title: Superscript
description: Raise selected text above the baseline.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Superscript

Raises selected text above the baseline, for exponents and reference markers. Applying it again removes the formatting.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
