---
title: Underline
description: Underline selected text.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Underline

Underlines selected text. Applying it again to the same range removes the formatting, and the mark is preserved in saved documents.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
