---
title: Tabel
description: Masukkan beberapa paragraf dan blok ke dalam sel, lalu edit latar, penggabungan, dan perataan.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tabel

Pilih baris dan kolom dari bilah alat untuk membuat tabel. Sel dapat berisi beberapa paragraf, gambar, daftar, kutipan, kode, bagian yang dapat diciutkan, dan video. Letakkan kursor di dalam sel untuk mengedit baris, kolom, penggabungan, sel tajuk, dan warna latar melalui alat properti di bawahnya.

Coba edit paragraf dan daftar dalam sel pada contoh di bawah, lalu seret melintasi beberapa sel untuk mengubah latarnya sekaligus. Klik **Pilih tabel** di alat properti untuk meratakan tabel itu sendiri dari bilah alat utama.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

Daftarkan juga sayap yang ingin digunakan di dalam sel. Untuk editor yang memakai semua sayap dasar, rakit dengan `wings().allBasic()`.

## Menulis di dalam sel

| Masukan | Perilaku |
| --- | --- |
| Enter dalam paragraf biasa | Membuat paragraf baru di sel yang sama. |
| Shift+Enter | Menambahkan pergantian baris dalam paragraf atau item daftar saat ini. |
| Tab / Shift+Tab dalam paragraf biasa | Berpindah ke sel berikutnya / sebelumnya. |
| Tab / Shift+Tab dalam daftar atau kode | Menggunakan penambahan / pengurangan inden milik blok tersebut. |

Enter dalam daftar dan kode mengikuti aturan masukan masing-masing blok. Sekalipun inden kode tidak bisa dikurangi lagi, Shift+Tab tidak berpindah ke sel sebelumnya. Backspace atau Delete di awal atau akhir sel tidak menggabungkannya dengan sel tetangga atau paragraf di luar tabel.

Penempelan serta penyisipan gambar atau blok tetap berada dalam sel tempat operasi dimulai. Penyisipan blok dan penempelan tidak tersedia untuk pilihan yang melintasi batas sel. Tabel dan [area mengambang](./float) tidak dapat disarangkan di dalam sel; saat struktur tersebut diimpor atau ditempel, isinya dikeluarkan secara berurutan.

Sel biasa dapat berisi judul, tetapi format judul tidak diterapkan pada sel tajuk. Mengubah sel menjadi sel tajuk mengubah judul di dalamnya menjadi paragraf biasa, sambil mempertahankan teks dan format lainnya.

## Warna latar sel

Warna latar diterapkan pada satu sel atau rentang persegi panjang yang dipilih dengan menyeret. Meskipun hanya sebagian teks yang dipilih, latar seluruh sel yang memuatnya akan berubah. Warna lembut menyesuaikan tema terang dan gelap. Jika beberapa sel yang dipilih memiliki warna berbeda, tidak ada satu warna yang ditampilkan sebagai terpilih.

Anda juga dapat mengubah warna melalui perintah sambil mempertahankan pilihan sel saat ini.

```ts
nabi.applyCommand('setCellColor', { bg: 'cyan' })
```

Nilai yang diizinkan adalah `yellow`, `green`, `cyan`, `pink`, `purple`, dan `orange`. Untuk memulihkan latar bawaan, pilih **Bawaan** di alat properti atau berikan string kosong.

```ts
nabi.applyCommand('setCellColor', { bg: '' })
```

Menghapus isi, memotong, dan membersihkan format tidak menghapus warna latar sel. Penggabungan memakai warna sel kiri atas; pemisahan memberikan warna yang sama pada sel baru. Baris dan kolom yang baru ditambahkan dimulai dengan latar bawaan. Perubahan warna latar mendukung urungkan dan ulangi.

## Meratakan isi sel dan tabel

Saat kursor berada di dalam sel, perataan diterapkan pada paragraf atau gambar di dalamnya. Jika beberapa sel dipilih, perataan diterapkan sekaligus ke semua paragraf dan objek yang dapat diratakan di dalamnya, kecuali kode. Status alat judul, perataan, dan huruf awal besar juga mengikuti paragraf internal yang benar-benar dipilih. Jika nilainya berbeda antarparagraf terpilih, nilai tersebut tidak ditampilkan sebagai satu nilai.

Untuk meratakan tabel itu sendiri, klik **Pilih tabel** di alat properti, lalu gunakan tombol perataan di bilah alat utama. Perataan yang sama tersedia ketika kursor berada sebelum atau sesudah paragraf pembungkus tabel dan batas putus-putus muncul. Batas ini hanya menunjukkan sasaran; tidak mengubah kursor menjadi pilihan seluruh tabel.

```ts
nabi.applyCommand('selectTable')
nabi.applyCommand('setAlign', { value: 'c' })
```

Menambah atau menghapus baris dan kolom, menggabungkan, serta memisahkan bekerja berdasarkan sel yang dipilih. Penggabungan mempertahankan blok setiap sel sesuai urutan baris. Pemisahan mempertahankan isi di sel asal dan membiarkan sel lainnya kosong.

## Menyalin dan menyimpan

Menyalin beberapa sel terpilih menyalin rentang persegi panjang yang terlihat hingga sel terakhir. HTML dan format internal papan klip mempertahankan sel kosong, penggabungan, blok, format teks, dan warna latar. Teks biasa memisahkan sel dengan tab dan pergantian baris, sambil mempertahankan pergantian baris antarblok dalam sel serta alamat gambar dan video. Memotong hanya mengosongkan isi sel terpilih dan dapat dibatalkan dengan satu tindakan urungkan.

Saat kursor berada sebelum atau sesudah tabel dan batas putus-putus muncul, penyalinan dan pemotongan berlaku untuk seluruh paragraf pembungkus tabel. Pemotongan menghapus paragraf dan tabel setelah penulisan ke papan klip berhasil. Memotong atau menghapus tabel di dalam area mengambang tetap menyisakan area mengambang luarnya.

Penyimpanan dalam JSON atau HTML mempertahankan blok dan warna latar sel. Tabel sederhana diekspor sebagai tabel Markdown; tabel dengan beberapa blok atau warna latar tetap berupa HTML agar isinya terjaga. Dalam HTML, nama warna sel disimpan pada atribut `data-nabi-cell-color` milik `td` atau `th`. Gaya warna latar sembarang dari HTML eksternal tidak diimpor sebagai warna latar sel.

Untuk mengurutkan kolom pada tampilan terbit, simpan tabel sebagai tabel yang dapat diurutkan dan hubungkan `attachViewer()` dari `nabi-note/viewer`. Tabel dengan sel gabungan tidak termasuk dalam pengurutan kolom.

## Gaya CSS

Atur gaya tabel dengan `.nabi-content table` dan sel dengan `.nabi-content :is(th, td)`. Terapkan garis warna selang-seling dan latar tajuk hanya pada sel tanpa warna agar tidak menimpa warna latar yang telah ditetapkan.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { font-weight: 700; }
.article-body th:not([data-nabi-cell-color]) { background: var(--nabi-soft); }
.article-body tr:nth-child(even) td:not([data-nabi-cell-color]) {
  background: color-mix(in srgb, var(--nabi-soft) 45%, transparent);
}
```

Ubah warna latar sel itu sendiri melalui variabel CSS bernama warna, seperti `--nabi-cell-yellow`. Muat CSS berikut setelah CSS paket, lalu tetapkan kelas `table-note` dan nilai `data-nabi-theme` tema saat ini langsung pada elemen `.nabi` editor atau elemen `.nabi-content` tampilan terbit.

```css
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-cell-cyan: #e2f4f7;
}
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

Jika viewer terhubung, pertahankan tombol `.nabi-sort`. Menimpa `position` atau padding kanan sel secara paksa dapat menyebabkan tumpang tindih dengan tombol pengurutan.
