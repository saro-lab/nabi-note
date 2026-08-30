---
title: 任务列表
description: 将完成状态和文档一起保存的列表。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 任务列表

带有完成状态的列表。在空段落中输入 `[ ]` 或 `[x]` 后按 Space，或从工具栏创建，然后点击复选框改变状态。

每一项的勾选状态会和文档一起保存。拆分项目时，勾选状态会跟随保留文字的那一项，而不是前面的空项目，因此拆分已完成任务时状态不会意外反转。

<WingDemo path="/wing/block/task-list" />

```ts
const selected = wings().use('tl').build()
```
