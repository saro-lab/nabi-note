---
title: İtalik
description: Seçili metni italik yapın.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# İtalik

Seçili metni eğik gösterir. Eser adlarını veya yabancı sözcükleri ana metinden hafifçe ayırmak için uygundur. Zaten eğik olan bir aralıkta yeniden basmak biçimi kaldırır.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
