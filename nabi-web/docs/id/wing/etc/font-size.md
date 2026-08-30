---
title: Ukuran huruf
description: Ubah ukuran teks dalam langkah yang diizinkan.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Ukuran huruf

Ubah teks yang dipilih ke suatu langkah ukuran. Jika rentang dipilih, langkah berlaku untuk rentang itu; jika hanya ada kursor, ukuran teks paragraf saat ini diubah. Data tersimpan hanya memuat langkah yang diizinkan, bukan nilai bebas seperti `px`.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

Jika `values` dihilangkan, langkah `xs`, `sm`, `lg`, dan `xl` digunakan. Jika daftar dipersempit, langkah lain yang sudah ada dalam dokumen lama dihapus ketika dimuat.

## Gaya CSS

Ukuran dapat diubah melalui pemilih langkah tersimpan seperti `.nabi-content [data-nabi-size="xs"]`. Jangan membuat langkah bebas yang tidak ada di dokumen; sesuaikan CSS hanya dalam `values` yang terdaftar.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

Menjaga perbedaan ukuran antarlangkah tetap konsisten mempertahankan maksud yang dipilih penulis di editor ketika dokumen diterbitkan.
