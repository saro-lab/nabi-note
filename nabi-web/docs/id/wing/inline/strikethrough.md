---
title: Coret
description: Coret teks terpilih.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Coret

Mencoret teks terpilih. Menerapkannya lagi pada rentang yang sama akan menghapus pemformatan, dan mark tetap disimpan dalam dokumen.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
