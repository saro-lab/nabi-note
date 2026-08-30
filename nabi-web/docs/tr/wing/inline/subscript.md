---
title: Alt simge
description: Seçili metni baseline altına indirin.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Alt simge

Kimyasal formüller ve indisler için seçili metni baseline altına indirir. Tekrar uygulamak biçimlendirmeyi kaldırır.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
