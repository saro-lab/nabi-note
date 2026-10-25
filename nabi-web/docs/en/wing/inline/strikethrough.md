---
title: Strikethrough
description: Strike through selected text.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Strikethrough

Draw a line through the middle of selected text. Use it to keep changed wording or content that is no longer valid visible without deleting it. Applying it again to the same range removes the formatting.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
