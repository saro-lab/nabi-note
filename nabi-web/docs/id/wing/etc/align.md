---
title: Perataan
description: Ubah perataan horizontal untuk paragraf dan blok objek.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Perataan

Ratakan paragraf saat ini, atau paragraf dalam rentang pilihan, ke kiri, tengah, atau kanan. Objek di dalam paragraf, seperti gambar, video, dan tabel, diratakan melalui paragraf pembungkusnya.

Perataan disimpan sebagai atribut paragraf, bukan pemformatan teks. Blok kode dikecualikan dari perataan karena inden di sana memiliki makna.

Di dalam sel tabel, perataan diterapkan pada paragraf atau gambar di posisi kursor. Memilih beberapa sel dengan menyeret menerapkannya pada semua paragraf dan gambar yang dapat diratakan di dalam sel tersebut. Jika pilihan berisi perataan berbeda, tidak ada tombol perataan yang ditampilkan sebagai terpilih.

Untuk meratakan tabel itu sendiri, klik **Pilih tabel** pada alat kontekstualnya, atau letakkan kursor sebelum atau sesudah tabel di paragraf pembungkusnya, lalu gunakan tombol perataan di toolbar utama. Ubah posisi kiri atau kanan area mengambang melalui alat kontekstual area tersebut, bukan tombol perataan.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```

Untuk menerapkan perintah pada pilihan saat ini, gunakan `l` untuk kiri, `c` untuk tengah, dan `r` untuk kanan.

```ts
nabi.applyCommand('setAlign', { value: 'c' })
```
