---
title: 删除线
description: 给删除的值或修改前的内容加上删除线。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 删除线

给选中的文字加上删除线。对同一范围再次应用会移除该格式，保存文档时 mark 会保留。

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
