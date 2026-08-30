---
title: Menggunakan CDN
description: Contoh menghubungkan NABI NOTE untuk browser tanpa alat build.
---

<script setup>
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
</script>

# Menggunakan CDN

Pada halaman statis yang sulit memasang paket, Anda dapat memuat bundel browser dan CSS NABI NOTE melalui CDN. Contoh berikut membaca versi paket secara otomatis saat build untuk membuat alamat, lalu menyusun editor melalui objek global `NabiNote`.

<CdnDemo />

## Hal yang perlu diperiksa di NABI NOTE

- Dalam kode penerapan, gunakan versi tetap yang sama untuk CSS dan JavaScript browser. Alamat tanpa versi seperti `latest` dapat mengubah perilaku saat versi baru dirilis.
- Bundel browser menyediakan API akar sebagai `window.NabiNote`. Tidak ada bundel global terpisah untuk `nabi-note/ssr`, `nabi-note/viewer`, dan `nabi-note/diff`.
- Penyimpanan berkas dan riwayat lokal pada contoh berjalan di browser pengguna. Jika memerlukan penyimpanan server atau sinkronisasi akun, kirim hasil `getJson()` ke API aplikasi.
- Saat menambahkan unggahan, sambungkan bukan hanya wing `upload`, tetapi juga fungsi pengiriman yang sebenarnya serta wings gambar atau tautan yang diperlukan. Server unggahan bertanggung jawab memeriksa berkas.
- Bundel browser menyertakan HTML parser secara internal. Karena itu, `setHtml()`, membuka berkas HTML, dan menempelkan HTML tidak memerlukan opsi parser terpisah atau API privat.

CDN hanya berbeda pada cara memuatnya. Format penyimpanan dan validasi masukan sama seperti saat memasang lewat npm, jadi baca juga [penggunaan dasar](/id/guide/getting-started).
