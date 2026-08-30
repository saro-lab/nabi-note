---
title: 斜体
description: 将选中的文字倾斜，以便与正文区分。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 斜体

将选中的文字设为斜体。对同一范围再次应用会移除该格式，保存文档时 mark 会保留。

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
