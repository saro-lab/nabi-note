---
title: 斜体
description: 選択した文字を斜体にします。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 斜体

選択した文字を斜体にします。同じ範囲にもう一度適用すると解除され、保存した文書ではこの mark が保たれます。

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
