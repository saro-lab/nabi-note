---
title: 太字
description: 選択した文字を太字にします。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 太字

選択した文字を太字にします。同じ範囲にもう一度適用すると解除されます。保存した文書では、この mark が文字と一緒に残ります。

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
