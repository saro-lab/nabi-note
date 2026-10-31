---
title: Tautan
description: Hubungkan alamat web aman dan tampilkan lampiran yang diunggah.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tautan

Pilih teks lalu lampirkan alamat padanya. Jika Anda memasukkan alamat tanpa memilih teks, alamat itu sendiri dimasukkan sebagai teks tautan. Mengetik alamat `http://` atau `https://` lalu menekan Space atau Enter juga mengubahnya menjadi tautan.

Tautan hanya menyimpan `http:`, `https:`, dan path situs yang sama yang diawali `.` atau `/`. Alamat yang asalnya tidak dapat dikenali jelas, seperti `javascript:` atau `//example.com`, ditolak. Tautan lampiran yang dibuat oleh upload juga menyimpan informasi file dan tidak dapat dibuat manual seperti tautan biasa.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## Menempelkan URL

Jika seluruh konten yang ditempel, tanpa spasi kosong di awal dan akhir, merupakan URL `http://` atau `https://` yang valid, konten langsung dimasukkan sebagai tautan. URL di dalam kalimat, teks yang memuat beberapa URL, dan path relatif mengikuti perilaku tempel yang sudah ada. Di blok kode dan editor tanpa wing tautan, konten tetap berupa teks. Data clipboard internal yang valid dari editor diprioritaskan agar format aslinya tetap terjaga.

Gunakan callback `onPasteUrl` di `mountSurface()` untuk menentukan teks tampilan tautan.

| Argumen | Nilai |
| --- | --- |
| `url` | URL lengkap tanpa spasi kosong di awal dan akhir |
| `isSameOrigin` | Apakah protokol, host, dan port URL sama dengan origin dokumen yang memuat editor |
| `path` | Path yang dimulai dengan `/`, termasuk query dan fragmen. Contoh: `/posts/1?a=2#top` |

```ts
const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#editor')!,
  onPasteUrl(url, isSameOrigin, path) {
    if (isSameOrigin && path === '/guide') return 'NABI NOTE'
    return url
  },
})
```

String yang dikembalikan dan memuat karakter selain spasi kosong akan menjadi teks tampilan. Jika callback tidak tersedia, mengembalikan nilai kosong atau bukan string, atau gagal, URL yang ditempel tetap menjadi teks tampilan. String yang dikembalikan tidak pernah ditafsirkan sebagai HTML dan tidak mengubah alamat tautan.

Callback juga mendukung fungsi `async` dan Promise. Tautan URL langsung dimasukkan saat respons masih ditunggu; hasil valid yang datang kemudian hanya mengubah teks tampilan tautan tersebut. Hasil yang terlambat diabaikan jika tautan sudah diedit atau dihapus, dokumen baru sudah dimuat, atau surface sudah dilepas.

## CSS Styles

Beri gaya tautan biasa dengan `.nabi-content a`, dan tautan lampiran secara terpisah dengan `.nabi-content a[data-nabi-file]`.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

Bagian `::before` dan `::after` pada tautan lampiran dipakai untuk menampilkan ikon dan ekstensi file, jadi biasanya sebaiknya jangan mengganti atau menghapus `content`-nya.
