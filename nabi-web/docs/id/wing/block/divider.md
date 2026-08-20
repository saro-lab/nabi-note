---
title: Pembatas
---

# Pembatas

## Penjelasan

`dividerWing` (nama `hr`) memiliki satu `<hr>` saja. **`place: 'void'`** — objek
tanpa isi, jadi karet tidak punya tempat untuk masuk ke dalamnya. Menekan Backspace
atau Delete tepat sebelum atau sesudah pembatas membuat blok itu lenyap seluruhnya,
dan memilihnya sebagai rentang memberi hasil yang sama.

Menekan tombolnya membuat pembatas berdiri **mengenakan paragraf pembungkusnya
sendiri**. Tidak ada paragraf kosong tambahan yang ikut dibuat — karet duduk di atas
paragraf pembungkus itu, tepat di belakang pembatas.

Tempat ia berdiri bergantung pada apakah paragraf tempat karet berada punya isi.

| Tempat karet berada | Hasil |
|---|---|
| Paragraf berisi teks | Berdiri **di belakang** paragraf itu |
| Paragraf kosong | **Menggantikan** paragraf itu — tidak ada satu baris kosong pun yang tersisa |

Saat menggantikan paragraf kosong, perataan yang dipegang paragraf itu tetap bertahan.

Mengetik tiga tanda hubung atau lebih (`---`) saja di awal baris lalu menekan Enter
memberi hasil yang sama — konversi otomatis ini **dipicu oleh Enter**.

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar sayap membangun pengetahuan jenis, perintah, dan perakit sekaligus — itulah `registry`
const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
