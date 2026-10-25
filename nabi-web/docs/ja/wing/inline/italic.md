---
title: 斜体
description: 選択した文字を斜体にします。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 斜体

選択した文字を斜体で表示します。作品名や外国語などを本文と少し区別したいときに便利です。すでに斜体の範囲でもう一度押すと解除されます。

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
