---
title: Ordered List
description: Turn ordered items into a numbered list.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Ordered List

Turn items whose order matters into a numbered list. Type a number and a period, such as `1.`, followed by Space in an empty paragraph, or switch selected paragraphs from the toolbar.

Displayed numbers are calculated from item positions, so they continue automatically when you add or indent items. Saving a custom starting number and counting from that number is not provided.

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
