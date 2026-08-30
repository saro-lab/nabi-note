---
title: Vibe coding AI
description: Bantu agen coding memakai NABI NOTE secara akurat berdasarkan API publik saat ini dan batas dokumentasinya.
---

# Vibe coding AI

NABI NOTE menyediakan [`llms.txt`](/llms.txt) untuk AI dan alat otomatisasi. Alih-alih meminta agen menebak seluruh pustaka, mulailah dengan indeks itu dan minta agen membaca hanya dokumen yang diperlukan tugas.

## Prompt untuk memulai

Isi kerangka kerja dan fitur yang Anda perlukan.

```text
Build an editor with NABI NOTE (nabi-note).
First read https://nabi.saro.me/llms.txt, then read only the documents needed for this task.

Environment: Vue 3 + TypeScript
Features: basic formatting, tables, images, and uploads
Stored source: NABI TREE JSON
Publishing: render stored JSON to HTML on the server

Use only public exports and APIs that exist in the installed types.
After implementation, run type checking and a build, then report changed files and verification results.
```

Jika agen tidak dapat membuka URL, sertakan `llms.txt` dan dokumen tertaut yang relevan dalam percakapan.

## Arahkan hanya ke yang diperlukan

`llms.txt` adalah indeks ringkas. Memberi agen hanya halaman yang relevan biasanya lebih berguna daripada mengirim semua dokumen sekaligus.

- perakitan npm: [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)
- penyiapan CDN: [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)
- pemilihan wing: [`wings.md`](https://nabi.saro.me/llms/wings.md)
- JSON, HTML, dan peristiwa perubahan tersimpan: [`document-model.md`](https://nabi.saro.me/llms/document-model.md)
- batas impor HTML, tempel, dan unggah: [`io-security.md`](https://nabi.saro.me/llms/io-security.md)
- wing kustom dan rendering server: [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), [`ssr.md`](https://nabi.saro.me/llms/ssr.md)
- viewer, diff, gaya, dan drop cap: [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), [`styling.md`](https://nabi.saro.me/llms/styling.md)
- impor dan tipe yang tepat: [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)

## Sertakan kebutuhan produk

Agen tidak dapat menyimpulkan penyimpanan, kebijakan keamanan, atau perilaku unggah hanya dari layar pengeditan. Nyatakan kerangka kerja sebenarnya, wing yang disertakan dan dikecualikan, apakah JSON dan HTML disimpan, kontrak permintaan serta respons titik akhir unggah, batas berkas, dan apakah halaman terbit memerlukan SSR, perilaku viewer, atau diff.

Untuk apa pun yang belum diputuskan, minta agen menjelaskan pilihan dan dampaknya sebelum menerapkan suatu pilihan.

## Tinjau hasilnya

Tinjau kode yang dihasilkan seperti kode lainnya. Secara khusus, pastikan bahwa kode itu:

- memuat `nabi-note/nabi.css` untuk konten edit dan terbit;
- memakai `registry` yang sama untuk wing terpilih dan setiap mount;
- menyimpan `getJson()`, bukan `getEditorHtml()`;
- tidak menulis langsung ke `innerHTML` elemen `.nabi-content` yang sedang diedit;
- melepas setiap mount ketika layar ditutup;
- memvalidasi tipe MIME, ukuran, otorisasi, dan lokasi penyimpanan di server unggah;
- memakai urutan wing serta opsi yang memengaruhi HTML secara cocok di server dan browser;
- mengonfirmasi nama ekspor sebenarnya melalui pemeriksaan tipe, tes, dan build.

Perilaku IME dan kursor, serta jalur simpan-muat, memerlukan verifikasi nyata walaupun halaman tampak bekerja sekali. Uji input komposisi di seluler dan pemulihan dokumen tersimpan.

## Utamakan versi terpasang

Ketika proyek sudah memasang `nabi-note`, ekspor `package.json` dan deklarasi tipenya lebih langsung relevan daripada situs web yang dibangun untuk rilis lain. Minta agen memeriksa perbedaan versi itu sebelum menulis kode.
