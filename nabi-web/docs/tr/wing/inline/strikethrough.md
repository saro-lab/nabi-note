---
title: Üstü çizili
description: Seçili metnin üstünü çizin.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Üstü çizili

Seçili metnin ortasından bir çizgi geçirir. Değiştirilen ifadeleri veya artık geçerli olmayan içeriği silmeden görünür tutmak için kullanılabilir. Aynı aralığa yeniden uygulamak biçimi kaldırır.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
