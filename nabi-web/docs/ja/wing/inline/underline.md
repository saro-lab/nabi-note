---
title: 下線
description: 選択した文字に下線を引きます。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 下線

選択した文字に下線を引きます。リンクのように見えることがありますが、アドレスや移動の動作は追加されない単純な文字書式です。

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
