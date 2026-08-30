---
title: Altı çizili
description: Seçili metnin altını çizin.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Altı çizili

Seçili metnin altını çizer. Aynı aralığa tekrar uygulamak biçimlendirmeyi kaldırır ve mark kaydedilmiş belgelerde korunur.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
