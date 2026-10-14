---
title: Judul
description: Mengubah paragraf menjadi judul dan menentukan tingkatnya.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Judul

Mengubah paragraf menjadi judul dan menentukan tingkatnya. Aktifkan judul melalui toolbar lalu pilih dari H1 hingga H6, atau pada paragraf kosong, ketik `#` hingga `######` lalu tekan Spasi.

Judul bukan jenis blok terpisah, melainkan atribut yang disimpan pada paragraf. Menekan judul sekali lagi mengembalikannya menjadi paragraf biasa, sehingga Anda dapat mengubah tingkatnya sambil mempertahankan struktur isi.

Pada sel biasa, paragraf di dalamnya dapat diubah menjadi judul. Judul tidak diterapkan pada sel kepala tabel, dan konversi menjadi sel kepala juga menghapus format judul yang sudah ada. Saat beberapa paragraf dipilih, toolbar menampilkan satu nilai aktif hanya jika semuanya memiliki tingkat judul yang sama.

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
