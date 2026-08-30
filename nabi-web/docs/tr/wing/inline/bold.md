---
title: Kalın
description: Seçili metni kalın yapın.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Kalın

Seçili metni kalın yapar. Aynı aralığa tekrar uygulamak biçimlendirmeyi kaldırır. Mark, kaydedilmiş belgelerde metinle birlikte kalır.

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
