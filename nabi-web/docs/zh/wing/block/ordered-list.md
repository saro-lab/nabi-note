---
title: 编号列表
description: 将顺序重要的项目变成编号列表。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 编号列表

把顺序重要的项目变成编号列表。在空段落中输入 `1.` 这样的数字和句点后按 Space，或从工具栏切换选中的段落。

显示的编号根据项目位置计算，因此新增或缩进项目时会自动延续。不提供保存自定义起始编号并从该编号开始计数的功能。

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
