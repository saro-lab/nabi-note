---
title: Clear Formatting
description: Remove text formatting and paragraph formatting from the selection.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Clear Formatting

Remove text formatting from the selected range at once. Registered default marks such as bold, color, and typeface, plus paragraph attributes such as heading, alignment, and drop cap, are included. Pressing Esc twice quickly performs the same action.

It does not turn document structures such as lists, tables, quotes, or images into plain text. The outside alignment of images and videos, and attachment links created by uploads, remain as they are.

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

The formatting wings you want to clear must also be selected, otherwise their formatting cannot be removed.
