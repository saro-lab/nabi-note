---
title: 番号付きリスト
description: 順序が重要な項目を番号付きリストにします。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 番号付きリスト

順序が重要な項目を番号付きリストにします。空の段落で `1.` のように数字とピリオドを入力してから Space を押すか、選択した段落をツールバーから切り替えます。

表示される番号は項目の位置から計算されるため、項目を追加したりインデントしたりしても自動で続きます。入力した開始番号を保存して任意の番号から数える機能はありません。

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
