---
title: Hapus format
---

# Hapus format

## Penjelasan

`clearFormatWing` adalah **konstanta jadi**. Cukup masukkan ke dalam array — tidak
ada opsi yang perlu diberikan.

Karena `place: 'tool'`, ia tidak menegakkan simpul sendiri di dalam dokumen. Satu
perintah (`clearFormat`) dan satu tombol bilah alat adalah semuanya.

- **Daftar yang dilucuti sudah dipatri di dalam inti.** Sebelas tanda inline (`b`,
  `i`, `u`, `s`, `sub`, `sup`, `hl`, `tc`, `fs`, `tf`, `a`) dan tiga atribut
  paragraf (`h` judul, `a` perataan, `dc` drop cap). Host tidak perlu mengurus
  daftar apa pun, dan tanda dari sayap yang Anda buat sendiri **tidak ikut
  dilucuti di sini**.
- **Pilih sebuah rentang lalu tekan** dan tanda-tanda pada bentangan itu, beserta
  atribut setiap paragraf yang tersentuh, lepas sekaligus.
- **Dengan hanya karet, ia melucuti selapis demi selapis** — dimulai dari **tanda
  paling dalam** di tempat karet berada, sepanjang bentangan tanda itu berlaku.
  Jika sudah tidak ada tanda lagi yang bisa dilucuti, barulah atribut paragraf
  yang lepas.
- **Tautan lampiran tidak pernah dilucuti** — tautan (`a`) yang membawa atribut
  `file` tak tersentuh di mana pun, sebab melepas kulitnya akan membuat lampiran
  itu menjadi teks biasa yang mati.
- **Perataan tetap bertahan pada paragraf yang membungkus sebuah benda.** Pada
  paragraf pembungkus gambar atau tabel, perataan (`a`) saja yang tidak dilucuti
  — menghapus format tidak boleh membuat gambarnya melompat kembali ke kiri.
- Jika tidak ada apa pun yang bisa dilucuti, perintah ini menjawab `null`, jadi
  tidak ada titik undo yang menumpuk.

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar sayap membangun pengetahuan golongan, perintah, dan perakit sekaligus — itulah `registry`
const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
