---
title: 箇条書き
description: 複数の項目を番号なしで並べます。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 箇条書き

複数の項目を順序なしで並べるリストです。空の段落で `-` に続けて Space を入力するか、ツールバーから切り替えます。選択した複数の段落をまとめてリストにすることもできます。

リスト内では Tab で 1 段階インデントし、Shift+Tab で戻します。Enter は次の項目を作り、空の項目でもう一度 Enter を押すとリストを終了できます。

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
