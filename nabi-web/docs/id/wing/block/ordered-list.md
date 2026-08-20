---
title: Daftar bernomor
---

# Daftar bernomor

## Penjelasan

`orderedListWing` (nama `ol`, pintasan `N`) memiliki `<ol>`. Item dibawa bersama lewat
`parts`, jadi `oli` tidak didaftarkan terpisah — bukan array, melainkan rekaman
(record).

```ts
parts: { oli: { holds: 'blocks' } }
```

Menekan tombolnya membungkus blok tempat karet berada (atau blok-blok yang tercakup
pilihan) menjadi daftar bernomor, dan menekannya lagi melepasnya. Menekan tombol daftar
lain menggantinya ke jenis itu.

Mengetik angka dan titik di awal baris lalu spasi (`1. `) juga memberi hasil yang sama.
**Angka berapa pun diakui sebagai awalan, tetapi jumlah digitnya dibatasi sampai
sembilan** (`1234567890. ` tidak terpicu), dan jika ada sesuatu setelah titik seperti
`1.2 `, itu tidak terpicu. Baris tidak perlu kosong — yang diperiksa hanya awal baris
di depan karet, dan ini hanya terpicu pada baris pertama paragraf.

- `Tab`/`Shift+Tab` untuk menambah/mengurangi indentasi, Enter pada item kosong yang
  mengakhiri daftar, dan Backspace di awal item yang menggabungkannya dengan item
  sebelumnya — semuanya sama seperti [daftar berpoin](./bullet-list).
- Nomor tidak masuk ke nilai tersimpan — itu digambar oleh `<ol>`, jadi jika sebuah
  item disisipkan atau dihapus, browser menghitung ulang sendiri.
- Penyarangan pun tersimpan apa adanya pada nilai tersimpan sebagai markup sungguhan.
  Karena item membawa blok, teks mengenakan satu lapis paragraf dan daftar yang
  disarangkan berdiri di dalam paragraf pembungkus.
- Atribut seperti `start`·`type` tidak bertahan. Jadi daftar yang masuk dengan
  `start="5"` pun dihitung ulang mulai dari 1.

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar sayap membangun pengetahuan jenis, perintah, dan perakit sekaligus — itulah `registry`
const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
