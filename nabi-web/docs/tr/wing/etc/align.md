---
title: Align
description: Change horizontal alignment for paragraphs and object blocks.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Align

Align the current paragraph, or the paragraphs in the selected range, left, center, or right. Objects that live inside a paragraph, such as images, videos, and tables, are aligned through the paragraph that wraps them.

Alignment is stored as a paragraph attribute, not as text formatting. Code blocks are excluded from alignment because indentation itself is meaningful there.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```
