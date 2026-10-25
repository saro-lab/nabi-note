---
title: 上付き
description: 選択した文字を基準線より上に上げます。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 上付き

選択した文字をベースラインの上に小さく表示します。指数や脚注の印に使え、選択した範囲だけに適用されます。

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
