---
title: Tabel
---

# Tabel

## Penjelasan

`tableWings`(nama `table`, pintasan `T`) memiliki struktur `table > tr > td`.

Baris (`tr`) dan sel (`td`) tidak didaftarkan terpisah — sayap tabel membawanya serta lewat
`parts`, jadi bila tabel dicabut, baris dan sel ikut tercabut juga.

```ts
parts: {
  tr: { holds: 'blocks' },
  td: { holds: 'blocks', singleParagraph: true, boolAttrs: ['th'] },
}
```

`singleParagraph` pada sel itulah yang menjaga kisi — menekan <kbd>Enter</kbd> di dalam sel
tidak membelah paragrafnya jadi dua, dan menghapus seleksi yang melintasi dua sel tidak
menyatukan kedua sel itu.

Menekan tombolnya bukan sebuah toggle — yang muncul adalah kisi ukuran baris×kolom (maksimum
8×8), lalu tabel seukuran pilihan Anda masuk ke posisi karet dan karetnya berpindah ke sel
pertama.

Perintah baru muncul di baris konteks ketika karet berada di dalam tabel.

| Golongan | Kolom |
|---|---|
| Baris | tambah baris di atas · tambah baris di bawah · hapus baris |
| Kolom | tambah kolom di kiri · tambah kolom di kanan · hapus kolom |
| Penggabungan | gabung (satu toggle) |
| Header | jadikan baris ini header · jadikan kolom ini header (berubah menjadi `<th>`) |
| Pengurutan | nyalakan/matikan pengurutan (menyusun kolom di sisi pembaca) |
| Hapus | hapus tabel |

**Penggabungan adalah satu toggle** — bukan tombol per arah. Pilih beberapa sel lalu tekan
dan semuanya menyatu jadi satu; taruh karet di sel yang sudah tergabung lalu tekan lagi dan
gabungannya lepas kembali.

**Tidak ada kolom di baris ini untuk menaruh kotak tabel di kiri · tengah · kanan.** Posisi
tabel bukan dipikul tabelnya sendiri melainkan paragraf pembungkus yang menampungnya, jadi
tombol perataan pada toolbar utama yang mengerjakan itu.

::: warning Penanda pengurutan dan penggabungan
Pengurutan **hanya sebuah penanda**. Editor tetap memasangnya pada tabel yang sudah
tergabung, dan menggabungkan sel pun tidak melepas penanda yang sudah terpasang.

Namun **sisi pembacalah yang menolak** — `attachTableSort` sama sekali tidak dipasang pada
tabel yang memiliki sel tergabung yang tampak. Baris yang tergabung terikat satu sama lain
sehingga penyusunan ulang akan merusak kisinya. Jadi pada tabel yang tergabung, penandanya
ada tetapi tidak terjadi apa-apa.
:::

## Lebarnya ditentukan isinya

Tabel tidak punya pengaturan lebar. Tabel melebar **hanya sebesar isinya**, dan bila lebih
lebar dari tempatnya, ia **menggulir ke samping** di tempat itu juga — halaman tidak ikut
terdorong. Tidak ada `<div>` pembungkus pula. Yang keluar ke nilai tersimpan hanya satu
`<table>`, dan atribut yang melekat hanyalah perataan (`data-nabi-align`) dan penanda
pengurutan.

## Perpindahan dan pemilihan

`Tab`/`Shift+Tab` memindahkan Anda antar sel (di ujung tabel ia diam di tempat). Karena sel
hanya memuat inline, Enter tidak membelah selnya melainkan **mengganti baris di dalam sel
itu** — membelahnya berarti harus menciptakan blok yang tidak dapat dimuat kisinya. Tombol
panah bergerak mengikuti kisi, bukan mengikuti layar.

Anda bisa menyeret dengan tetikus melintasi beberapa sel untuk memilihnya. Seleksi seret ini
pun dipikul sayapnya sendiri lewat `attach`, sehingga **tidak ada yang perlu di-mount
terpisah** — `mountSurface` memasangnya sekaligus.

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, tableWings } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// daftar sayap membangun pengetahuan golongan, perintah, dan perakit sekaligus — itulah `registry`
const { nabi, registry } = createNabiWith([...tableWings])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/table" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
