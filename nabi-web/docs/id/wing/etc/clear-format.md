---
title: Hapus pemformatan
description: Hapus pemformatan teks dan paragraf dari pilihan.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Hapus pemformatan

Hapus pemformatan teks dari rentang pilihan sekaligus. Ini mencakup tanda bawaan yang terdaftar seperti tebal, warna, dan jenis huruf, serta atribut paragraf seperti judul, perataan, dan drop cap. Menekan Esc dua kali dengan cepat melakukan tindakan yang sama.

Ini tidak mengubah struktur dokumen seperti daftar, tabel, kutipan, atau gambar menjadi teks biasa. Perataan luar gambar dan video, serta tautan lampiran yang dibuat oleh unggahan, tetap seperti semula.

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

Wing pemformatan yang ingin dihapus juga harus dipilih; jika tidak, pemformatannya tidak dapat dihapus.
