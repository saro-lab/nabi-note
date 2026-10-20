---
title: "Catatan kaki"
description: "Hubungkan penjelasan tambahan dengan nomor dalam teks dan daftar di akhir dokumen."
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Catatan kaki

Hubungkan penjelasan tambahan dengan nomor dalam teks dan daftar di akhir dokumen.

Masukkan isi melalui tombol catatan kaki di bilah alat untuk menyisipkannya pada posisi kursor. Jika teks dipilih, catatan disisipkan di akhir pilihan tanpa mengganti teks. Nomor tidak disimpan, tetapi ditetapkan otomatis sesuai urutan dokumen.

Klik nomor dalam teks untuk mengedit isinya di baris properti. Gunakan alat hapus, atau tekan Backspace atau Delete dua kali di samping catatan untuk memilih lalu menghapusnya. Daftar di bawah hanya dapat dibaca dan menghilang saat tidak ada catatan kaki.

Dalam pratinjau dan halaman terbit dengan viewer terhubung, arahkan penunjuk, klik, atau ketuk nomor untuk membaca isinya. Isi hanya menerima satu baris teks biasa dan ditampilkan dengan font sans serif berukuran 0,875 kali ukuran dasar teks utama. HTML ditampilkan secara harfiah.

<WingDemo path="/wing/inline/footnote" />

```ts
const selected = wings().use('fn').build()
```
