---
title: Alt simge
description: Seçili metni baseline altına indirin.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Alt simge

Seçili metni taban çizgisinin altında daha küçük gösterir. `H₂O` kimyasal formülü gibi alt simge gerektiren gösterimler için uygundur. Bu biçim formül hesaplama özelliği eklemez; gösterimin kendisini korumak için kullanın.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
