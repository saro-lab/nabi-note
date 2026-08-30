---
title: İtalik
description: Seçili metni italik yapın.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# İtalik

Seçili metni italik yapar. Aynı aralığa tekrar uygulamak biçimlendirmeyi kaldırır ve mark kaydedilmiş belgelerde korunur.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
