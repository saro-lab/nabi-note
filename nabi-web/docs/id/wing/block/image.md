---
title: Gambar
description: Sisipkan URL gambar dan sesuaikan lebar serta perataannya.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Gambar

Sisipkan URL gambar lalu sesuaikan lebar dan perataannya. Secara bawaan, alamat dibatasi pada `http:`, `https:`, atau jalur situs yang sama; gambar baru dimulai di tengah dengan lebar 60%.

Lebar hanya disimpan dalam langkah tetap, dan perataan disimpan pada paragraf pembungkus gambar. Untuk memakai pratinjau `blob:` atau `data:image/...`, izinkan URL lokal secara eksplisit pada wing gambar maupun perakitan editor. URL data SVG tidak diizinkan.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

Wing ini menyisipkan alamat ke dalam dokumen; wing ini tidak mengunggah berkas. Untuk mengirim berkas ke server, hubungkan [wing unggah](/id/wing/etc/upload).

## Menghubungkan pemilih gambar

Gunakan `panels.img` di `mountToolbar()` untuk mengganti dialog URL bawaan tombol gambar dengan pemilih gambar layanan Anda. Kunci adalah nama slot toolbar; alat yang tidak dicantumkan tetap menggunakan dialog bawaannya.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: ({ root, signal, run }) =>
      mountMyImagePicker(root, {
        signal,
        onSelect: (url: string) => run('insertImage', { src: url }),
      }),
  },
})
```

`mountMyImagePicker` adalah fungsi yang Anda implementasikan di layanan Anda. Fungsi ini membuat UI secara sinkron di dalam `root` yang diberikan dan mengembalikan fungsi pembersihan. Hubungkan `signal` ke pekerjaan asinkron seperti memuat daftar gambar atau mengunggah, lalu teruskan URL gambar yang dipilih ke `onSelect`. API ini tidak mengirim berkas; aturan URL gambar yang sudah ada tetap berlaku.

Menutup panel atau melepas toolbar membatalkan `signal` dan memanggil fungsi pembersihan. `run()` menutup panel dan menerapkan perintah satu kali pada pilihan yang disimpan saat panel dibuka. Jika panel sudah ditutup atau isi dokumen berubah sejak dibuka, fungsi ini mengembalikan `false` tanpa menjalankan perintah.

## Gaya CSS

Atur gaya gambar dengan `.nabi-content img`. Pertahankan lebar dan perataan tersimpan, dan ubah hanya detail visual seperti batas atau bayangan.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

Pertahankan aturan bawaan untuk `max-inline-size`, `block-size`, lebar, dan perataan. Ukuran gambar disimpan dalam dokumen, sehingga memaksakan lebar CSS tetap dapat berbenturan dengan lebar pilihan penulis.
