---
title: Superskrip
description: Naikkan teks terpilih di atas baseline.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Superskrip

Menampilkan teks terpilih dalam ukuran lebih kecil di atas garis dasar. Dapat digunakan untuk pangkat atau penanda catatan kaki dan hanya berlaku pada rentang terpilih.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
