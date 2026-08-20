---
title: Gambar
---

# Gambar

## Penjelasan

`imageWing` (id `img`) memiliki gambar (`<img>`). Seperti `hr` dan `youtube`, ia
adalah **blok tanpa isi**. Menekan tombolnya memunculkan lapisan isian alamat.

**Alamat disaring berdasarkan skema, bukan ekstensi.** Hanya `http:`, `https:`, dan
jalur relatif yang lolos; alamat protocol-relative seperti `//example.com/a.png`
ditolak. Apakah alamat berakhiran `.png` **tidak pernah diperiksa** — alamat yang
menyajikan gambar tanpa ekstensi itu umum.

Karet tidak bisa masuk ke dalam gambar, jadi mengeklik sebuah gambar akan memilih
gambar itu seluruhnya dan memunculkan baris konteks.

| Golongan | Kolom |
|---|---|
| Lebar | Delapan kolom kelipatan sepuluh dari `30` sampai `100` (bawaan `60`) — berupa penggeser, dan nilai sekarang ikut tampil |
| Lihat | Gambarnya saja, diperbesar — tidak mengubah dokumen |

**Baris konteks hanya berisi keduanya.** Kolom rata kiri·tengah·kanan tidak ada di
sini — posisi gambar bukan milik gambar itu sendiri, melainkan milik **paragraf
pembungkus** yang menampungnya, sehingga tombol perataan di toolbar-lah yang
mengurus itu.

**Gambar yang baru disisipkan selalu rata tengah** — `insertLump` memasang
perataan `c` pada paragraf pembungkusnya saat menyusunnya.

Saat keluar, lebar melekat pada gambar dan perataan melekat pada paragraf yang
membungkusnya.

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

Nilai perataan adalah `l`·`c`·`r`. `style` inline tidak ikut keluar — rupa yang
sebenarnya digambar oleh lembar gaya yang membaca atribut itu di dalam
`.nabi-content` yang sudah dipasangi `nabi.css`.

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

Menyalakan `allowLocalUrls` juga mengizinkan alamat `blob:` dan `data:image/...` —
nyalakan hanya pada skenario demo atau unggahan yang menampilkan pratinjau berkas
tanpa server. Bawaannya mati.

Ketika sebuah gambar rusak (alamatnya mati, kedaluwarsa, atau blob-nya hilang),
penampung sementara muncul dengan sendirinya — wing menanganinya lewat `attach`,
dan `mountSurface` memasang `attach` dari setiap wing yang terdaftar. **Tidak ada
yang perlu di-mount terpisah.** Penanda ini hanya untuk layar dan tidak pernah
tertinggal pada nilai tersimpan.

`allowLocalUrls` bisa dinyalakan di dua tempat — untuk seluruh editor
(`createNabiWith(wings, { allowLocalUrls: true })`), atau hanya untuk wing gambar
saja (`makeImageWing({ allowLocalUrls: true })`).

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar wing sekaligus membangun pengetahuan skema, perintah, dan perakit — itulah `registry`
const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Untuk membiarkan berkas yang diterima dari unggahan (alamat `blob:`) tetap terbuka
apa adanya:

```ts
makeImageWing({ allowLocalUrls: true })
```

## Demo

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
