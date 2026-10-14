---
title: Area mengambang
description: Letakkan teks, gambar, dan tabel di samping teks utama agar paragraf berikutnya mengalir di sisinya.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Area mengambang

Letakkan deskripsi singkat, gambar, atau tabel kecil di kiri atau kanan, lalu biarkan teks utama mengalir di sisinya. Isi area dapat diedit langsung dalam editor yang sama. Batas putus-putus hanya tampil saat mengedit; pratinjau dan tampilan terbit hanya menampilkan isi dan tata letaknya.

Letakkan kursor di dalam area pada contoh di bawah, lalu ubah sisi dan lebar maksimumnya melalui alat properti. Pada pratinjau, Anda dapat melihat aliran teks tanpa batas putus-putus.

<WingDemo path="/wing/block/float" />

```ts
const selected = wings().allBasic().build()
```

Area mengambang termasuk dalam sayap dasar. Jika hanya merakit sayap yang diperlukan, gunakan `wings().use('float')` atau daftarkan `floatWing` secara langsung. Daftarkan juga sayap gambar, tabel, daftar, dan isi lain yang digunakan di dalam area.

## Membuat dan menempatkan

Letakkan kursor di teks utama lalu klik **Area mengambang** untuk membuat area kosong. Nilai bawaannya adalah sisi kanan dengan lebar maksimum 40%. Jika beberapa paragraf dipilih sebelum diklik, semua paragraf yang tersentuh pilihan akan dibungkus sepenuhnya dalam satu area. Anda tidak dapat membungkus ulang area mengambang yang sudah ada atau membuat area mengambang lain di dalamnya.

```ts
nabi.applyCommand('insertFloat', { side: 'right', w: 40 })
```

Saat kursor berada di dalam area, gunakan alat properti untuk mengubah sisi kiri atau kanan dan lebar maksimum. Pilih 20%, 30%, 40%, atau 50%. Nilainya relatif terhadap lebar teks utama, bukan seluruh layar; isi yang pendek dapat membuat lebar sebenarnya lebih kecil.

```ts
nabi.applyCommand('setFloatSide', { side: 'left' })
nabi.applyCommand('setFloatWidth', { w: 30 })
```

Menempelkan teks, gambar, dan tabel, mengubah jenis blok, serta mengunggah tetap berada di dalam area. Menghapus tabel di dalamnya hanya menghapus tabel tersebut. Penyisipan atau perubahan jenis blok internal tidak tersedia saat pilihan mencakup bagian dalam dan luar area sekaligus.

Tombol **Lepaskan area mengambang** di samping nilai lebar mengembalikan isi ke teks utama tanpa menghapusnya. Pembuatan, perubahan tata letak, dan pelepasan pembungkus mendukung urungkan dan ulangi.

```ts
nabi.applyCommand('unwrapFloat')
```

## Cara teks mengalir di sekitar area

Paragraf berikutnya mengalir di samping area, lalu kembali memakai lebar penuh teks utama setelah area berakhir. Judul, tabel, blok kode, pemisah, atau area mengambang baru berikutnya dimulai di bawah area sebelumnya.

Jika lebar teks utama kurang dari `36rem`, area dan teks ditata dalam satu kolom. Pencetakan juga menggunakan satu kolom sambil mempertahankan sisi dan lebar maksimum yang tersimpan. Tampilan perbandingan dokumen mempertahankan sisi dan lebar maksimum setiap area, tetapi menampilkan blok berikutnya secara terpisah di bawahnya agar perubahan lebih mudah dibaca.

## Menyimpan dan memuat

JSON menyimpan `a.side` dan `a.w` dari simpul `float` beserta blok di dalamnya. HTML menggunakan atribut `data-nabi-float` dan `data-nabi-float-width` pada `div` di dalam paragraf objek biasa.

```html
<div data-nabi-p>
  <div data-nabi-float="right" data-nabi-float-width="40">
    <p>Deskripsi yang diletakkan di samping teks utama.</p>
  </div>
</div>
<p>Paragraf ini mengalir di samping area.</p>
```

Ekspor Markdown mempertahankan area sebagai HTML. Gaya CSS `float` sembarang tidak diimpor, jadi gunakan JSON atau HTML yang dibuat oleh NABI NOTE untuk menyimpan dan memulihkan. Hubungkan sayap dan CSS yang sama pada editor, SSR, pratinjau, dan tampilan terbit agar sisi serta lebarnya tetap terjaga.

## Gaya CSS

Atur warna dan jarak dalam area dengan selektor `[data-nabi-float]`. Paragraf luar mengatur tata letak dan lebar maksimum, jadi jangan menimpa `float`, `display`, atau lebar secara langsung.

```css
.brand-note .nabi-content [data-nabi-float] {
  background: var(--nabi-soft);
  border-radius: var(--nabi-radius);
  padding: .75rem;
}
```
