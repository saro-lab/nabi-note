---
title: YouTube
description: Sematkan video YouTube ke dokumen dan sesuaikan lebarnya.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

Terima URL atau ID video YouTube lalu ubah menjadi blok sematan. Dokumen hanya menyimpan ID video 11 karakter dan lebarnya, bukan URL lengkap; video baru dimulai di tengah dengan lebar 70%.

Lebar dipilih dari beberapa langkah tetap dan perataan disimpan pada paragraf pembungkus video. Di editor, klik pertama memilih video; setelah dipilih, klik lagi dapat memutarnya. Untuk mengubah alamat, hapus video lalu sisipkan yang baru.

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## Gaya CSS

Gunakan `.nabi-content iframe` untuk mengubah batas atau sudut video. Jangan mengubah lebar maupun perataan yang tersimpan.

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

Paket memakai `aspect-ratio`, lebar, dan margin perataan agar ukuran video tepat; jangan menimpanya.
