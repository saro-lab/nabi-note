---
title: Strikethrough
description: Strike through selected text.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Strikethrough

Strikes through selected text. Applying it again to the same range removes the formatting, and the mark is preserved in saved documents.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
