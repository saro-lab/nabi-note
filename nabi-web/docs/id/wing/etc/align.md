---
title: Perataan
---

# Perataan

## Penjelasan

**Satu** `alignWing` (id `align`) memegang ketiga nilai kiri, tengah, dan kanan
sekaligus. Ia sebuah konstanta — bukan satu pabrik `align()` yang mengikat
semuanya, melainkan satu tombol tersendiri untuk tiap nilai. Ia memasang atribut
`data-nabi-align` pada bloknya.

- Ia **atribut blok** yang membiarkan tagnya apa adanya dan hanya menempelkan
  atribut. Seperti `<p data-nabi-align="center">`, paragrafnya sendiri tidak
  berubah.
- **Ia berlaku pada paragraf dan judul.** `<h2 data-nabi-align="c">` pun boleh —
  sebab judul juga sebuah baris tulisan. Dari empat atribut paragraf, hanya
  perataan yang begitu; ukuran huruf, jenis huruf, dan drop cap tetap khusus
  paragraf.
- Nilainya hanya satu pada satu waktu — jika rata kiri sudah terpasang lalu Anda
  menekan rata tengah, yang kiri lepas dan yang tengah menempel. Menekan lagi
  nilai yang sedang terpasang membuat atributnya lepas seluruhnya (kembali ke
  perataan bawaan).
- **Enter meneruskan perataan yang sama ke kedua belah pihak.** Membelah sebuah
  paragraf membuat keduanya keluar dengan perataan yang sama — berbeda dari
  judul (`h`) yang lepas dari sisi yang kosong, dan drop cap (`dc`) yang hanya
  mengikuti satu sisi. Perataan tidak punya pengecualian semacam itu.
- Ketiganya adalah **tiga tombol pada satu sayap** (`buttons`) — tidak bisa
  dinyalakan atau dimatikan secara terpisah, dan yang dimasukkan ke dalam array
  wings cukup `alignWing` itu sendiri.
- **Tempat tabel, gambar, dan YouTube juga diatur oleh sayap ini.** Sebuah benda
  hidup di dalam paragraf pembungkusnya, dan paragraf itulah yang memegang
  perataan, sehingga "gambar rata tengah" sesungguhnya berarti "gambar di dalam
  paragraf yang rata tengah". Karena itu baris konteks gambar dan tabel sama
  sekali tidak punya kolom perataan, dan hanya perataan yang tidak ikut
  bersembunyi dari bilah alat sekalipun karet berada di atas sebuah benda.

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar sayap membangun pengetahuan golongan, perintah, dan perakit sekaligus — itulah `registry`
const { nabi, registry } = createNabiWith([alignWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/align" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
