---
title: 下付き
description: 選択した文字を基準線より下に下げます。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 下付き

選択した文字をベースラインの下に小さく表示します。化学式の `H₂O` のように下付き文字が必要な表記に適しています。数式の計算機能を追加する書式ではないので、表記そのものを保つために使います。

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
