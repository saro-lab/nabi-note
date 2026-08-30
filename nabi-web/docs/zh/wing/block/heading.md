---
title: 标题
description: 将段落改为标题并选择级别。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 标题

将段落改成标题并选择级别。可以在工具栏中启用标题并选择 H1 到 H6，也可以在空段落中输入 `#` 到 `######` 后按 Space。

标题不是单独的块类型，而是作为段落属性保存。再次按标题会回到普通段落，因此可以在保持正文结构不变的情况下只调整级别。

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
