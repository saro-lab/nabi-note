---
title: Bullet List
description: List several items without numbering them.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Bullet List

A bullet list presents several items without order. Type `-` followed by Space in an empty paragraph, or switch to it from the toolbar. Selected paragraphs can also be grouped into a list at once.

Inside a list, Tab indents one level and Shift+Tab outdents. Enter creates the next item, and pressing Enter again from an empty item ends the list.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
