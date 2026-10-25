---
title: Subskrip
description: Turunkan teks terpilih di bawah baseline.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Subskrip

Menampilkan teks terpilih dalam ukuran lebih kecil di bawah garis dasar. Cocok untuk notasi yang memerlukan subskrip, seperti rumus kimia `H₂O`. Format ini tidak menambahkan perhitungan rumus; gunakan untuk mempertahankan notasinya.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
