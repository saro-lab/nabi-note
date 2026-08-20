---
title: Drop cap
---

# Drop cap

## Penjelasan

`dropCapWing` adalah atribut blok bernilai tunggal yang memasang
`data-nabi-dropcap="1"` pada sebuah paragraf. Ia tidak membuat blok baru, hanya
menumpangkan penanda pada paragraf yang sudah ada.

- Nilainya hanya satu, nyala/mati — menekan tombolnya lagi membuat atributnya
  lepas.
- **Tidak ada opsi maupun variabel untuk menentukan berapa baris yang
  dirangkulnya.** Satu aturan `::first-letter` pada lembar gaya inti yang
  mematok ukurannya — `font-size: 5.9em; line-height: .83`. Berapa baris yang
  sungguh-sungguh tertutup oleh huruf itu ditentukan oleh tinggi baris paragraf
  yang bersangkutan.
- Karena yang disentuhnya hanya satu huruf pertama, Enter memperlakukan atribut
  ini seperti sebuah tanda — membelah paragraf menjadi dua tidak menggandakannya
  ke kedua sisi, melainkan membuatnya mengikuti huruf itu.

Untuk mengubah ukurannya, timpa aturan tersebut.

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar sayap membangun pengetahuan golongan, perintah, dan perakit sekaligus — itulah `registry`
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
