---
title: 删除线
description: 给删除的值或修改前的内容加上删除线。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 删除线

在选中文字的中间画一条线。可用于保留已修改的措辞或不再有效的内容，而不将其删除。对同一范围再次应用即可取消。

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
