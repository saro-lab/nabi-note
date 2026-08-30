---
title: Heading
description: Turn a paragraph into a heading and choose its level.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Heading

Turn a paragraph into a heading and choose its level. Enable heading in the toolbar and choose H1 through H6, or type `#` through `######` followed by Space in an empty paragraph.

A heading is not a separate block type. It is stored as an attribute on a paragraph. Pressing heading again returns it to a normal paragraph, so you can change only the level while keeping the body structure intact.

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
