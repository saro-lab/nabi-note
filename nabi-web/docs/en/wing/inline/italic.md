---
title: Italic
description: Italicize selected text.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Italic

Italicize selected text. This is useful for subtly distinguishing titles of works or foreign words from the body text. Click again on a range that is already italicized to remove the formatting.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
