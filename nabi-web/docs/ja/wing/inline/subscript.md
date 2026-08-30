---
title: 下付き
description: 選択した文字を基準線より下に下げます。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 下付き

選択した文字を基準線より下に下げます。化学式や添字に使えます。もう一度適用すると解除されます。

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
