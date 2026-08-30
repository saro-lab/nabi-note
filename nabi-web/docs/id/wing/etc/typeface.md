---
title: Jenis huruf
description: Terapkan keluarga jenis huruf ke teks terpilih atau paragraf.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Jenis huruf

Terapkan keluarga jenis huruf ke teks yang dipilih. Jika suatu rentang dipilih, hanya rentang itu yang berubah; jika hanya ada kursor, perubahan diterapkan pada teks di paragraf saat ini. Berkas font sebenarnya dan nilai `font-family` ditentukan oleh CSS layanan.

Keluarga bawaan adalah `sans`, `serif`, `mono`, dan `cursive`. Terutama pada layanan yang memuat bahasa Korea atau konten multibahasa lain, sebaiknya tentukan secara eksplisit font yang digunakan setiap keluarga.

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

Jika `values` dihilangkan, semua keluarga bawaan digunakan. Hanya nilai dalam `values` yang diizinkan pada dokumen.

## Gaya CSS

Dokumen hanya menyimpan nama keluarga, dan CSS memilih berkas font. Ubah variabel pada kontainer yang sama untuk editor dan tampilan terbit.

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif", "Noto Serif KR", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

Jika memakai font web, muat berkas font tersebut lebih dahulu. `cursive` sering tidak memiliki cakupan yang baik untuk banyak bahasa, jadi sebaiknya sediakan setelah memilih font sebenarnya yang akan dipakai layanan Anda.
