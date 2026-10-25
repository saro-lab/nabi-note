---
title: 取り消し線
description: 選択した文字に取り消し線を引きます。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 取り消し線

選択した文字の中央に線を引きます。変更した表現や無効になった内容を削除せずに残すときに使えます。同じ範囲にもう一度適用すると解除されます。

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
