---
title: 下划线
description: 给选中的文字加上下划线。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 下划线

为选中的文字添加下划线。虽然看起来可能像链接，但这只是文字格式，不会添加地址或跳转行为。

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
