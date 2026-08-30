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
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Letakkan token bersama pada parent umum agar editor dan tampilan terbitannya mempertahankan bahasa visual yang sama.

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
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

Token sorotan dan warna teks memakai `--nabi-hl-<name>` dan `--nabi-tc-<name>`. Misalnya, mengubah `--nabi-hl-yellow` mengubah warna tampilan sorotan `yellow` yang tersimpan tanpa mengubah data dokumen.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## Mode gelap

Mode terang adalah bawaan. Tambahkan `.dark` pada `html` atau `body`, atau atur `data-nabi-theme="dark"` pada editor atau isi terbitan tertentu.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Gunakan `data-nabi-theme="light"` untuk tidak mengikuti `.dark` pada ancestor. Aplikasi Anda mengendalikan pergantian tema; paket tidak otomatis mengikuti `prefers-color-scheme`.

```css
.dark .brand-note {
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
  --nabi-font: "Source Serif 4", Georgia, serif;
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
