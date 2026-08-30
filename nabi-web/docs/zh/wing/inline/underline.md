---
title: 下划线
description: 给选中的文字加上下划线。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 下划线

给选中的文字加上下划线。对同一范围再次应用会移除该格式，保存文档时 mark 会保留。

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
