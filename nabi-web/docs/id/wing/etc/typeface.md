---
title: Jenis huruf
---

# Jenis huruf

## Penjelasan

`typefaceWing` (nama `tf`) adalah **tanda nilai inline**. Ia konstanta jadi —
cukup masukkan ke dalam array, tidak ada opsi yang perlu diberikan. Pada saat
keluar, ia digambar sebagai `<span data-nabi-typeface="serif">`.

Nilainya ada empat (`TYPEFACES`): `sans`, `serif`, `mono`, dan `cursive`.

- **Sayap ini sama sekali tidak memegang nama font apa pun.** Yang Anda pilih
  adalah **golongannya**, dan font mana yang sungguh-sungguh muncul ditentukan
  oleh nilai yang ditumpangkan host pada empat token `--nabi-font`,
  `--nabi-font-serif`, `--nabi-font-mono`, dan `--nabi-font-cursive`.
- Keempat golongan itu dipegang oleh **satu sayap** saja. Tempat memilihnya
  adalah empat kolom (`select`) di bilah alat konteks, dan sebagai jalan masuk
  ada satu tombol di bilah alat — menekannya memasang `serif`.
- **Tulisan yang tidak memasang apa pun mengenakan `--nabi-typeface-base`.**
  Token inilah jenis huruf dasar seluruh editor, dan jika tidak diubah ia
  mengikuti `--nabi-font`. Tidak ada kolom tersendiri untuk "bawaan" — **memilih
  ulang golongan yang sedang terpasang justru melepasnya**, kembali ke dasar
  itu.
- Kolom-kolom pilihannya **digambar dalam rupa yang ditunjuknya sendiri**. Kolom
  serif ditulis dalam serif, kolom monospace dalam monospace, sehingga tampak
  apa yang dipilih walau tanpa tahu namanya.
- **Dengan hanya karet, ia berlaku pada seluruh paragraf.** Pada paragraf yang
  belum berisi huruf sama sekali, ia tersimpan sebagai janji dan huruf
  berikutnya yang diketik akan keluar dalam jenis huruf itu.

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, typefaceWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar sayap membangun pengetahuan golongan, perintah, dan perakit sekaligus — itulah `registry`
const { nabi, registry } = createNabiWith([typefaceWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Font yang ditumpangkan host cukup satu tempat di CSS. Jika Anda menumpuk beberapa
font pada satu golongan, peramban akan menyisir dari depan untuk tiap huruf dan
menggambarnya dengan font pertama yang memiliki huruf itu, sehingga bahasa apa
pun yang dituliskan tetap mempertahankan rupa golongan tersebut.

```css
:root {
  --nabi-font: 'Noto Sans', 'Noto Sans KR', 'Noto Sans JP', system-ui, sans-serif;
  --nabi-font-serif: 'Noto Serif', 'Noto Serif KR', Georgia, serif;
  --nabi-font-mono: 'Noto Sans Mono', ui-monospace, monospace;
  --nabi-font-cursive: 'Caveat', 'Gaegu', cursive;
}
```

## Demo

<WingDemo path="/wing/etc/typeface" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
