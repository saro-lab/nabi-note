---
title: 見出し
description: 段落を見出しに変え、レベルを選びます。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 見出し

段落を見出しに変え、レベルも指定します。ツールバーで見出しを有効にして H1 から H6 までを選ぶか、空の段落で `#` から `######` までを入力してから Space を押します。

見出しは別のブロック種類ではなく、段落に保存される属性です。見出しをもう一度押すと通常の段落に戻るため、本文構造を保ったままレベルだけを変更できます。

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
