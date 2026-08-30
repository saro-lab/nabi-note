---
title: Miring
description: Miringkan teks terpilih.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Miring

Memiringkan teks terpilih. Menerapkannya lagi pada rentang yang sama akan menghapus pemformatan, dan mark tetap disimpan dalam dokumen.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
