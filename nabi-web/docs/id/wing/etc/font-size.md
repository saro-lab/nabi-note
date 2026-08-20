---
title: Ukuran huruf
---

# Ukuran huruf

## Penjelasan

`fontSizeWing` (nama `fs`) adalah **tanda nilai inline**. Ini format yang
ditumpangkan di atas huruf, bukan atribut paragraf. Pada saat keluar, ia digambar
sebagai `<span data-nabi-size="lg">`.

Nilainya ada empat — `xs`, `sm`, `lg`, `xl` — dan ukuran bawaan bukanlah nilai
kelima melainkan **atribut yang sama sekali tidak ada**.

- Ia berpasangan dengan jenis huruf (`tf`) — satu sayap memegang seluruh nilai,
  dan tempat memilihnya ada di bilah alat konteks. Hanya saja jenis huruf
  menyusun empat kolom, sedangkan ukuran memakai satu skala saja.
- **Kontrol konteksnya adalah skala (`range`).** Ukuran adalah nilai yang
  berurutan (kecil → besar), jadi alih-alih menyusun kolom, ia memberi satu
  gagang untuk digeser. Nilai yang sedang terpasang tampak sebagai posisi
  gagangnya, dan nama nilai itu ikut tampil pada label.
- **Kolom paling depan pada skala itulah "Bawaan"** — di depan, bukan di tengah,
  sebab daftarnya berjalan dari kecil ke besar dan tempat sebelum itu adalah
  tempat "tidak ada yang terpasang". Memindahkan gagang ke sana tidak menuliskan
  nilai seperti `base`, melainkan **melepas tandanya**.
- **Label kolomnya mengikuti lokal** — dalam bahasa Indonesia berbunyi "Bawaan ·
  Sangat kecil · Kecil · Besar · Sangat besar".
- Menekan tombol bilah alat memasang **`lg` (Besar)**. Karena skalanya berjalan
  dari kecil, membiarkannya apa adanya akan memasang kolom pertama `xs`, padahal
  tidak ada orang yang menekan tombol ukuran huruf dengan maksud membuat
  hurufnya mengecil.
- **Dengan hanya karet, ia berlaku pada seluruh paragraf.** Jarang ada yang ingin
  membesarkan satu kata saja, jadi tanpa rentang terpilih ia menyasar paragraf
  (berbeda dengan sorotan dan warna huruf, yang menyasar bentangan tanda tempat
  karet berdiri).
- Ditekan pada paragraf yang belum berisi huruf sama sekali, ia tetap **tersimpan
  sebagai janji** — huruf berikutnya yang diketik akan keluar dengan ukuran itu.
- Menerapkan nilai yang sama sekali lagi akan melepasnya.

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar sayap membangun pengetahuan golongan, perintah, dan perakit sekaligus — itulah `registry`
const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
