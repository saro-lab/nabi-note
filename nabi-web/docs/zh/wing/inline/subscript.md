---
title: 下标
description: 像化学式一样，把文字小号显示在基线之下。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 下标

将选中的文字以较小字号显示在基线下方。适合化学式 `H₂O` 等需要下标的写法。这种格式不提供公式计算功能，用于保留写法本身。

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
