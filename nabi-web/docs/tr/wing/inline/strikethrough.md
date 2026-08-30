---
title: Üstü çizili
description: Seçili metnin üstünü çizin.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Üstü çizili

Seçili metnin üstünü çizer. Aynı aralığa tekrar uygulamak biçimlendirmeyi kaldırır ve mark kaydedilmiş belgelerde korunur.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
