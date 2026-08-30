---
title: Daftar bernomor
description: Membuat item yang urutannya penting menjadi daftar bernomor.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Daftar bernomor

Membuat item yang urutannya penting menjadi daftar bernomor. Pada paragraf kosong, ketik angka dan titik seperti `1.` lalu tekan Spasi, atau ubah paragraf yang dipilih melalui toolbar.

Nomor yang ditampilkan dihitung dari posisi item, sehingga tetap berlanjut otomatis saat Anda menambah atau menjorokkan item. Fitur untuk menyimpan angka awal yang diketik dan menghitung dari nomor sembarang tidak tersedia.

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
