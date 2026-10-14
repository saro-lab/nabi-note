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

在普通单元格中，可以将内部段落设为标题。表头单元格不支持标题格式，转换为表头时也会清除已有的标题格式。选中多个段落时，只有所有段落的标题级别相同，工具栏才会显示一个共同的激活值。

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
