---
title: 上标
description: 像脚注和指数一样，把文字小号显示在基线之上。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 上标

将选中的文字抬到基线之上，适合指数和引用标记。再次应用会移除该格式。

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
