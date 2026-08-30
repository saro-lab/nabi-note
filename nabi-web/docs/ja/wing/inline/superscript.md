---
title: 上付き
description: 選択した文字を基準線より上に上げます。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 上付き

選択した文字を基準線より上に上げます。指数や参照番号に使えます。もう一度適用すると解除されます。

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
