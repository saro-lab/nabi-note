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

Inside a table cell, alignment applies to the inner paragraph or image at the cursor. Dragging to select several cells applies it to all alignable paragraphs and images in those cells. When a selection mixes different alignments, no alignment button is shown as selected.

To align the table itself, click **Select table** in its context tools, or place the cursor before or after the table inside its wrapping paragraph, then use the main toolbar's alignment buttons. Change a float area's left or right placement in its context tools instead of using alignment buttons.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```

To apply a command to the current selection, use `l` for left, `c` for center, and `r` for right.

```ts
nabi.applyCommand('setAlign', { value: 'c' })
```
