---
title: Garis bawah
description: Beri garis bawah pada teks terpilih.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Garis bawah

Memberi garis bawah pada teks terpilih. Menerapkannya lagi pada rentang yang sama akan menghapus pemformatan, dan mark tetap disimpan dalam dokumen.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
