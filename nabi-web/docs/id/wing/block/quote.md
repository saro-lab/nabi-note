---
title: Kutipan
---

# Kutipan

## Penjelasan

`quoteWing` (nama `quote`) memiliki kotak kutipan (`<blockquote>`). Statusnya
`place: 'container'` dan `holds: 'blocks'` — di dalamnya blok yang hidup. Seperti
objek lain, kutipan sendiri mengenakan satu paragraf pembungkus dan berdiri di
tingkat teratas.

**`allows` tidak dipasang.** Bagian dalam kutipan mengikuti aturan yang sama dengan
tingkat teratas, jadi tabel atau gambar pun bisa berdiri di dalamnya dengan mengenakan
paragraf pembungkus — HTML semacam itu, jika ditempel atau dimuat, tetap bertahan
apa adanya.

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["teks"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

Namun **tombol sisip tidak masuk ke dalam kutipan.** Hal-hal yang berdiri lewat
`insertLump` — gambar, tabel, pembatas — selalu mengambil tempat di **tingkat
teratas**, jadi walau karet berada di dalam kutipan, objek baru berdiri di
**belakang** kutipan itu. Untuk memasukkannya ke dalam kutipan, gunakan tempel.

Menekan tombolnya membungkus semua blok tingkat teratas yang tercakup pilihan menjadi
kutipan. Ia hanya lepas kalau semua yang tercakup **sudah berupa kutipan** — kalau
campuran, ia dibungkus sekali lagi secara utuh.

Mengetik `>` saja di awal baris lalu spasi juga menjadikan baris itu kutipan —
konversi otomatis ini **dipicu oleh spasi** (bukan Enter), karena Anda melanjutkan
menulis pada baris yang sama.

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar sayap membangun pengetahuan jenis, perintah, dan perakit sekaligus — itulah `registry`
const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
