---
title: 分隔线
description: 插入分隔文档流的水平线。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 分隔线

用于分隔文档流的水平线。在空段落中输入三个或更多连字符后按 Enter，或从工具栏插入。

分隔线是不含文字的独立块，因此不能带有标题或颜色等格式。请只用它分隔前后的段落。

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
