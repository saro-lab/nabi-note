---
title: Task List
description: A list that stores completion state with the document.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Task List

A list with completion state. Type `[ ]` or `[x]` followed by Space in an empty paragraph, or create one from the toolbar, then click the checkbox to change its state.

The checked state is stored with each item in the document. When an item is split, the checked state follows the item that keeps the text rather than the empty item before it, so splitting a completed task does not flip the state unexpectedly.

<WingDemo path="/wing/block/task-list" />

```ts
const selected = wings().use('tl').build()
```
