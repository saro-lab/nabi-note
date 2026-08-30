---
title: 加粗
description: 将选中的文字显示为粗体。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 加粗

将选中的文字设为粗体。对同一范围再次应用会移除该格式。保存文档时，这个 mark 会和文字一起保留。

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
