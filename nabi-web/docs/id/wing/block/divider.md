---
title: Pemisah
description: Menyisipkan garis horizontal yang membagi alur dokumen.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Pemisah

Ini adalah garis horizontal yang memisahkan alur dokumen. Pada paragraf kosong, ketik tiga atau lebih tanda hubung lalu tekan Enter, atau sisipkan melalui toolbar.

Pemisah adalah blok mandiri tanpa teks, sehingga tidak memuat format seperti judul atau warna. Gunakan hanya untuk memisahkan paragraf sebelum dan sesudahnya.

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
