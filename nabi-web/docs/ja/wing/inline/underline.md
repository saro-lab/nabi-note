---
title: 下線
description: 選択した文字に下線を引きます。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 下線

選択した文字に下線を引きます。同じ範囲にもう一度適用すると解除され、保存した文書ではこの mark が保たれます。

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
