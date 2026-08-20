---
title: Tautan
---

# Tautan

## Penjelasan

`linkWing` (id `a`) memiliki `<a href>`. Menekan tombolnya membuka lapisan
isian alamat di dekat posisi karet, dan tombol konfirmasinya hanya aktif untuk alamat
yang diawali `http`/`https` — pemeriksaan daftar-putih inilah pertahanan XSS-nya
(skema seperti `javascript:` sama sekali tidak lolos). `href` yang tidak lolos
validasi tidak disimpan, dan dalam kasus itu isinya keluar sebagai teks biasa tanpa
tag `<a>`.

Lapisan itu punya dua kolom — alamat dan teks yang ditampilkan. Jika kolom teks
dikosongkan, alamatnya sekaligus menjadi teksnya; dan jika hanya ada karet tanpa huruf
terpilih, seluruh tanda tautan tempat karet berada menjadi sasarannya (aturan yang
sama dengan stabilo dan warna teks).

## Tautan yang sudah ada diperbaiki dari baris konteks

Ketika karet berdiri di dalam sebuah tautan, **dua kolom teks** muncul di baris konteks
— bukan tombol yang membuka lapisan, melainkan kolom isian yang berdiri di dalam baris
itu sendiri (`kind: 'text'`). Keduanya muncul sudah terisi nilai saat ini, dan
perubahan diterapkan saat Anda menekan Enter atau mengeklik di tempat lain. Jika
nilainya tidak berubah, tidak terjadi apa-apa.

| Kolom | Fungsinya |
|---|---|
| Alamat | Hanya mengubah alamatnya. Teks yang ditampilkan tetap seperti semula. |
| Teks tautan | Hanya mengubah teks yang ditampilkan. Alamat dan penanda lampiran tetap seperti semula. |

**Untuk lampiran (tautan berkas), kolom alamat tidak muncul** — alamat itu ditentukan
oleh proses unggah, bukan nilai yang pantas disunting dengan tangan. Kolom nama muncul
sama saja, baik pada tautan biasa maupun lampiran. Nama kosong tidak diterima —
membuat tautan tanpa nama bukanlah mengganti nama, melainkan menghapus.

## Lampiran ditangani sebagai satu kesatuan di layar

Lampiran diperlakukan sebagai satu kesatuan. Mengekliknya tidak menjatuhkan karet ke
dalamnya, melainkan **memilih seluruh tautan**, dan menekan backspace atau delete
tepat di sebelahnya akan **menghapus tautan itu sekaligus.** Menyunting adalah
tugas baris konteks, bukan karet.

Ini ditangani wing lewat `attach`, dan `mountSurface` memasangnya bersamaan —
**tidak ada yang perlu di-mount terpisah.**

## Penanda lampiran

Tautan yang masuk lewat unggahan membawa penanda `data-nabi-file` (nilainya adalah
ekstensi) — penanda inilah yang membuat lembar gaya menggambar kotak klip alih-alih
garis bawah. Mau namanya yang diubah atau alamatnya, penanda ini ikut terbawa. Hapus
format pun tidak melucuti lampiran — melepas kulitnya akan membuat lampiran itu
menjadi teks biasa yang mati.

`linkWing` adalah **konstanta** — tidak dipanggil dengan tanda kurung, dan tidak
ada opsi yang bisa diberikan.

::: warning `allowLocalUrls` tidak berlaku untuk tautan
Sakelar yang membuka alamat `blob:`/`data:` hanya berlaku **untuk gambar saja**.
Sisi keluar selalu ketat — pintu yang dipakai `getHtml()` untuk menyaring alamat
(`ctx.url`) tetap memakai daftar-putih itu apa pun yang dinyalakan host.

Karena itu, tautan lampiran yang membawa alamat `blob:` **akan jatuh menjadi teks
biasa tepat saat dikeluarkan.** Inilah sebabnya proses unggah tidak boleh membiarkan
alamat sementara itu apa adanya — setelah selesai diunggah, alamat itu harus ditukar
dengan alamat asli yang diterima agar tetap bertahan di dokumen.
:::

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar wing sekaligus membangun pengetahuan skema, perintah, dan perakit — itulah `registry`
const { nabi, registry } = createNabiWith([linkWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/link" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
