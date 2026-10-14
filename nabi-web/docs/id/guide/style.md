---
title: Tema CSS
description: Atur warna, font, ukuran, dan mode gelap untuk editor serta konten terbitan dengan variabel CSS.
---

# Tema CSS

NABI NOTE menggunakan CSS yang sama untuk pengeditan dan konten terbitan. Muat stylesheet paket sekali, lalu timpa hanya variabel yang Anda perlukan pada container layanan.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Berikan kelas tema yang sama pada `.nabi` editor dan `.nabi-content` tampilan terbitan untuk menerapkan variabel yang sama. Muat CSS layanan setelah CSS paket dan tentukan tema aktif melalui `data-nabi-theme`.

```html
<div class="nabi brand-note" data-nabi-theme="light">...</div>
<article class="nabi-content brand-note" data-nabi-theme="light">...</article>
```

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## Variabel umum

| Tujuan | Variabel |
| --- | --- |
| Teks dan latar belakang | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| Garis dan warna aksen | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| Sudut dan bayangan | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| Keluarga font | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| Surface pengeditan | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| Toolbar lengket dan pratinjau | `--nabi-sticky-top`, `--nabi-preview-width` |
| Kontrol sentuh | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| Lebar peralihan mode seluler | `--nabi-mobile-breakpoint` |

Sorotan dan warna teks memakai `--nabi-hl-<name>` dan `--nabi-tc-<name>`. Latar sel tabel memakai `--nabi-cell-<name>` dengan `yellow`, `green`, `cyan`, `pink`, `purple`, dan `orange`. Variabel hanya mengubah warna yang tampil, bukan nama warna yang disimpan.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

Tema bawaan menampilkan latar sel dengan warna lembut. Mode gelap mempertahankan nama warna tetapi memakai warna tersendiri yang lebih terang dan kurang jenuh agar mudah dibedakan di atas latar gelap. Warna tembus pandang ini memperlihatkan latar di bawahnya; saat menyesuaikan warna, periksa kontras teks pada latar halaman sebenarnya. Untuk menimpa variabel warna bawaan, terapkan kelas tema pada elemen editor atau konten terbitan yang sebenarnya seperti contoh di atas, bukan sembarang induk luar.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## Ambang mode seluler

Bilah alat bawaan `layout: 'compact'` beralih ke satu baris seluler saat lebar layar di bawah `36rem`. Tepat `36rem` tetap memakai tata letak desktop. Di desktop, semua alat membungkus ke baris berikutnya meski editornya sempit. Properti objek juga membungkus di bawahnya; kedua baris memakai ruang di atas teks. Layar penuh membuka semua alat tanpa bergantung pada lebar layar.

Di seluler, alat cepat, tombol semua alat, dan tombol pratinjau/layar penuh yang terhubung tetap berada di bilah utama. Semuanya tetap dapat digunakan saat alat properti muncul. Palet semua alat memakai urutan kelompok dan pemisah yang sama dengan desktop. `layout: 'wrap'` selalu menampilkan semua alat dengan pembungkusan baris.

Panel seluler terbuka pada ruang yang tersedia di sekitar bilah alat dan properti. Pemilih ukuran tabel menjadi pengecualian: terbuka di tengah di atas latar tembus pandang dengan kisi 5×5 yang mudah disentuh. Tidak menunggu papan ketik tertutup; memilih ukuran menyisipkan satu tabel lalu menutup pemilih.

Atur `--nabi-mobile-breakpoint` pada `:root`, leluhur, atau `.nabi` tertentu untuk mengubah ambang. Gunakan panjang CSS nonnegatif seperti `rem`, `px`, atau `calc()`. Perubahan nilai CSS, ukuran font akar, atau lebar layar otomatis memperbarui panel yang sudah terbuka. Panel input yang dipindahkan ke bawah `body` tetap mengikuti ambang editor asal.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

Wilayah mengambang memiliki ambang satu kolom tersendiri. Satu kolom digunakan ketika kontainer teks, bukan layar, lebih sempit dari `36rem`; pencetakan memakai tata letak yang sama.

## Mode gelap

Mode terang adalah bawaan. Tambahkan `.dark` pada `html` atau `body`, atau atur `data-nabi-theme="dark"` pada editor atau isi terbitan tertentu.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Gunakan `data-nabi-theme="light"` untuk tidak mengikuti `.dark` pada ancestor. Aplikasi Anda mengendalikan pergantian tema; paket tidak otomatis mengikuti `prefers-color-scheme`.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## Beri gaya juga pada konten terbitan

HTML terbitan juga memerlukan `.nabi-content` dan CSS yang sama. Tabel, blok kode, gambar, checklist, dan drop cap dirender tanpa JavaScript. Tambahkan `nabi-note/viewer` hanya untuk perilaku seperti pengurutan tabel atau penyorotan kode.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
  --nabi-bg: transparent;
}
```

Atur layout yang tidak dimiliki paket, seperti lebar isi dan tinggi baris, pada class layanan Anda.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## Jangan ubah struktur pengeditan

Jangan ubah `display` atau `white-space` pada node `[data-key]` yang sedang diedit, tambahkan pseudo-element di dalam teks yang dapat diedit, atau nonaktifkan perilaku pointer pada wrapper objek. Aturan ini dapat merusak geometri caret dan pemetaan dokumen.

Drop cap terbitan menggunakan `::first-letter`, sedangkan surface pengeditan menggunakan elemen `[data-nabi-dropcap-letter]` yang nyata. Jangan tambahkan aturan `::first-letter` lain di dalam `.nabi-editing` atau mengganti elemen tersebut.
