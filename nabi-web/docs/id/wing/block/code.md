---
title: Kode
description: Simpan kode multibaris bersama bahasa untuk penyorotan sintaks.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Kode

Sisipkan kode multibaris terpisah dari teks isi biasa. Ketik tiga tanda backtick di paragraf kosong lalu tekan Spasi atau Enter, atau ubah menjadi blok kode dari bilah alat. Jika Anda menambahkan nama bahasa setelah backtick, seperti `ts`, nama itu juga disimpan.

Nama bahasa adalah pengenal untuk penyorotan sintaks; nama di luar daftar terdaftar pun dapat diketik manual. Karena isi kode dan indentasi harus dipertahankan, blok kode tidak menerima perataan paragraf.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## Menghubungkan penyorot kode

Mendaftarkan blok kode memakai pewarnaan bawaan di editor. Untuk mewarnai kode juga pada tampilan terbit, hubungkan `nabi-note/viewer`. Viewer menemukan `pre > code` dan membaca nilai `data-nabi-lang` elemen induk sebagai nama bahasa. Jika nilainya tidak ada, viewer memeriksa kelas `language-...` pada elemen `code`.

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'en',
})

// Setelah HTML terbit diganti
viewer.refresh()

// Saat menutup layar
viewer.unmount()
```

Jika tidak ada penyorot terpisah, atau penyorot itu tidak dapat menangani bahasanya, tokenizer bawaan tanpa dependensi akan mewarnainya. Rentang token yang disisipkan penyorot hanya ada di layar dan tidak ditulis kembali ke JSON tersimpan atau HTML terbit asli. `refresh()` dan `unmount()` menghapus rentang tersebut lalu menyambungkan kembali dari kode asli saat ini.

### Cara situs NABI menghubungkan Shiki

Situs NABI memuat penyorot secara dinamis agar Shiki tidak masuk ke layar pertama atau bundel SSR. `loadCodeHighlighting()` di `nabi-web/docs/.vitepress/src/highlight.ts` membuat inti Shiki, lalu mengambil tata bahasa hanya ketika kode dalam bahasa itu benar-benar diperlukan. Contoh berikut memakai sambungan yang sama pada tampilan terbit.

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'en',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// Saat menutup layar
stop?.()
viewer.unmount()
```

Saat suatu bahasa muncul untuk pertama kali, unduhan tata bahasanya dimulai. Sampai saat itu, blok ditampilkan dengan tokenizer bawaan atau sebagai teks biasa. Setelah tata bahasa tiba, `onGrammarLoaded()` memanggil `viewer.refresh()` dan mewarnai blok kembali. Dengan begitu hanya bahasa yang diperlukan yang diunduh, dan tata bahasa yang datang terlambat diterapkan tanpa navigasi halaman lain.

Sisi editor memakai fungsi `highlight` yang sama. Demo situs NABI hanya mengganti `attach` `codeWing` bawaan dengan `makeCodeAttach({ highlight, version })`. `version` berubah setiap kali tata bahasa tiba dan menjadi sinyal untuk menggambar ulang kode yang sudah ditampilkan. Layanan mandiri dapat menerapkan sambungan tampilan-terbit lebih dahulu, lalu menambahkan pendekatan ini hanya jika pewarnaan Shiki juga diperlukan saat mengedit.

## Gaya CSS

Atur gaya blok kode dengan `.nabi-content pre`, dan kode dengan `.nabi-content pre > code`. Jangan mengubah `white-space`, karena hal itu memengaruhi pemisah baris kode dan pengeditan. Warna token dapat diubah dengan pemilih `[data-nabi-token]`.

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
