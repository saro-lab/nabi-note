---
title: Bold
description: Make selected text bold.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Bold

Makes selected text bold. Applying it again to the same range removes the formatting. The mark stays with the text in saved documents.

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
