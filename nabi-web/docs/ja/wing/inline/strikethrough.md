---
title: 取り消し線
description: 選択した文字に取り消し線を引きます。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 取り消し線

選択した文字に取り消し線を引きます。同じ範囲にもう一度適用すると解除され、保存した文書ではこの mark が保たれます。

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
