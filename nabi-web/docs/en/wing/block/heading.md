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

In ordinary table cells, you can turn inner paragraphs into headings. Headings do not apply to header cells, and converting a cell to a header also clears existing heading formatting. When several paragraphs are selected, the toolbar shows a single active value only if they all have the same heading level.

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
