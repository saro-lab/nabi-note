---
title: Üst simge
description: Seçili metni baseline üstüne çıkarın.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Üst simge

Üsler ve referans işaretleri için seçili metni baseline üstüne çıkarır. Tekrar uygulamak biçimlendirmeyi kaldırır.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
