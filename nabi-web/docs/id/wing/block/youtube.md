---
title: YouTube
---

# YouTube

## Penjelasan

`youtubeWing` (nama `youtube`, tanpa pintasan) memiliki sematan YouTube (`<iframe>`).
Ia **objek tanpa isi** (`place: 'void'`), sama seperti `hr`·`img`. Menekan tombolnya
memunculkan lapisan isian alamat, dan hanya alamat YouTube berbentuk `watch?v=`,
`youtu.be/`, `/embed/`, `/shorts/`, `/v/`, atau `/live/` yang lolos (termasuk awalan
`www.`, `m.`, `music.`, dan `youtube-nocookie.com`) — penilaiannya lewat penguraian
`URL()`, bukan pemeriksaan apakah sebuah string terkandung di dalamnya, jadi alamat
seperti `youtube.com.evil.test` tidak akan tersangkut.

Alamat yang masuk tidak dipercaya begitu saja — hanya **id video 11 karakter** yang
dicabut dan disimpan. Alamatnya sendiri tidak tersisa di nilai tersimpan — yang
tersisa hanyalah `{"w":"youtube","a":{"v":"<id>","w":"70"}}`, dan saat keluar ia
dirakit ulang menjadi satu bentuk, `https://www.youtube-nocookie.com/embed/<id>`.

Dengan alasan yang sama seperti `hr`, karet tidak masuk ke dalamnya, dan menekan
Backspace atau Delete tepat di depan/belakangnya membuatnya lenyap seluruhnya.
Sematan selain YouTube **dibuang seluruhnya** saat dimuat — dokumen asing tidak
didirikan di dalam dokumen kita.

## Baris konteks

Mengeklik videonya memunculkan dua kolom.

| Jenis | Kolom |
|---|---|
| Lebar | Enam tingkat `50` `60` `70` `80` `90` `100` (bawaan `70`) — berupa penggeser, nilai sekarang ikut tampil |
| Alamat | Lapisan isian yang sudah terisi id video sekarang |

**Tidak ada kolom rata kiri/tengah/kanan di sini.** Tempat video bukan video itu
sendiri yang memegangnya, melainkan **paragraf pembungkus** yang menampungnya, jadi
tombol perataan di toolbar-lah yang mengurusnya. Video yang baru dimasukkan
mengenakan perataan tengah (`c`) pada paragraf pembungkusnya.

Karena itu saat keluar, lebar melekat pada video sedangkan perataan melekat pada
paragraf yang membungkusnya.

```html
<div data-nabi-p data-nabi-align="c">
  <iframe src="https://www.youtube-nocookie.com/embed/<id>" title="YouTube"
          allowfullscreen loading="lazy" data-nabi-width="70"></iframe>
</div>
```

`style` inline tidak ikut keluar. Jika host ingin memasangnya lewat UI sendiri,
panggil perintahnya langsung — `applyCommand('insertYoutube', { v: alamat, w: '80' })`,
dan untuk mengubah lebar saja `applyCommand('setYoutubeWidth', { w: '80' })`. Lebar di
luar daftar ditolak.

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, youtubeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar sayap membangun pengetahuan jenis, perintah, dan perakit sekaligus — itulah `registry`
const { nabi, registry } = createNabiWith([youtubeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/youtube" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
