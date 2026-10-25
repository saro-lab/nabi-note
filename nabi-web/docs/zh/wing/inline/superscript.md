---
title: 上标
description: 像脚注和指数一样，把文字小号显示在基线之上。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 上标

将选中的文字以较小字号显示在基线上方。可用于指数或脚注标记，并且只应用于选中的范围。

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
