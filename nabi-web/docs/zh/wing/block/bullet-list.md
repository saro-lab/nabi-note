---
title: 项目符号列表
description: 不带编号地列出多个项目。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 项目符号列表

项目符号列表用于表示没有顺序要求的多个项目。在空段落中输入 `-` 后按 Space，或从工具栏切换。也可以一次把选中的多个段落组合成列表。

在列表内，Tab 缩进一级，Shift+Tab 取消缩进。Enter 创建下一项，从空项目再次按 Enter 会结束列表。

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
