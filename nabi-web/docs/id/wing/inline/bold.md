---
title: Tebal
description: Buat teks terpilih menjadi tebal.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tebal

Membuat teks terpilih menjadi tebal. Menerapkannya lagi pada rentang yang sama akan menghapus pemformatan. Mark tetap melekat pada teks di dokumen tersimpan.

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
