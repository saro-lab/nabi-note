---
title: 区切り線
description: 文書の流れを分ける横線を挿入します。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 区切り線

文書の流れを分ける横線です。空の段落にハイフンを 3 つ以上入力して Enter を押すか、ツールバーから挿入します。

区切り線は文字を持たない独立したブロックなので、見出しや色のような書式は持ちません。前後の段落を分ける目的でだけ使います。

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
