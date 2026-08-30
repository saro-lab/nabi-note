---
title: 下标
description: 像化学式一样，把文字小号显示在基线之下。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 下标

将选中的文字降到基线之下，适合化学式和索引。再次应用会移除该格式。

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
