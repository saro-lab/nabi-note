---
title: Divider
description: Insert a horizontal rule that separates the document flow.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Divider

A horizontal rule that separates the flow of the document. Type three or more hyphens in an empty paragraph and press Enter, or insert one from the toolbar.

A divider is an independent block with no text, so it does not hold formatting such as heading or color. Use it only to separate the paragraphs before and after it.

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
