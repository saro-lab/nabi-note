---
title: Judul
---

# Judul

## Penjelasan

`headingWing`(id `h`) **satu-satunya** yang memikul keenam tingkat sekaligus. Judul bukan
node tersendiri melainkan **atribut paragraf** — nilai tersimpannya `{"w":"p","a":{"h":2}}`,
dan saat keluar menjadi `<h2>`.

Karena paragraf itu sendiri yang menjadi judul, atribut paragraf lain seperti perataan dan
drop cap tetap melekat bersamanya (`<h2 data-nabi-align="c">`).

## Satu tombol di toolbar, tingkatnya dari baris konteks

**Tombol di toolbar hanya satu, `H`.** Ditekan pada paragraf, hasilnya judul 1, dan ketika
karet berada di dalam judul, kolom `Judul`·`H1`~`H6` muncul di baris konteks — tingkat yang
sedang berlaku tampak sebagai kolom yang tertekan, dan menekan kolom lain memindahkannya ke
tingkat itu. Menekan kolom `Judul` mengembalikannya menjadi paragraf.

Mengetik `#` sebanyak tingkatnya (untuk tingkat 2 berarti `##`) pada baris kosong lalu menekan
spasi otomatis menjadikannya judul pada tingkat itu — tanda `#` dan spasi yang Anda ketik ikut
terhapus.

## Contoh penggunaan

Pemilih tingkat digambar oleh `mountContextToolbar`.

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, headingWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// daftar sayap membangun pengetahuan golongan, perintah, dan perakit sekaligus — itulah `registry`
const { nabi, registry } = createNabiWith([headingWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Bisa juga dipasang langsung lewat perintah.

```ts
nabi.applyCommand('setHeading', { value: 2 })  // menjadi judul tingkat 2
nabi.applyCommand('setHeading', { value: 2 })  // tingkat yang sama lagi — kembali menjadi paragraf
```

Terapkan pada beberapa paragraf sekaligus dan itu berlaku pada **seluruh paragraf** yang
tersentuh seleksi. Blok yang menempati tempat paragraf sendiri, seperti tabel dan daftar,
dilewati — sebab judul adalah atribut paragraf teks.

## Demo

<WingDemo path="/wing/block/heading" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
