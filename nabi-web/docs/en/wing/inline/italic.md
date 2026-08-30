---
title: Italic
description: Italicize selected text.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Italic

Italicizes selected text. Applying it again to the same range removes the formatting, and the mark is preserved in saved documents.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
