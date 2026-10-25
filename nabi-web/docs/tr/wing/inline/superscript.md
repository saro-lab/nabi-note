---
title: Üst simge
description: Seçili metni baseline üstüne çıkarın.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Üst simge

Seçili metni taban çizgisinin üstünde daha küçük gösterir. Üsler veya dipnot işaretleri için kullanılabilir ve yalnızca seçili aralığa uygulanır.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
