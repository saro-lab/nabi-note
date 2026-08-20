---
title: Miring
---

# Miring

## Penjelasan

`italicWing` adalah pemilik (claim) dari `<i>`. Dipakai untuk huruf yang bernada lain,
seperti kata asing atau kutipan.

- Saat masuk, `<i>` dan `<em>` sama-sama diakui; saat keluar, semuanya dikumpulkan
  menjadi satu `<i>`. Tidak satu pun atribut dipertahankan.
- Pintasan pada mode petunjuk (tekan Shift dua kali cepat) adalah `I` — ditangkap
  sebagai tombol fisik (`KeyI`), jadi tetap bekerja pada tata letak papan ketik Hangul.
  Pintasan akselerator adalah `Ctrl`/`⌘`+`I` (`mod+i`).
- Menekannya sementara huruf terpilih berarti toggle.
- Jika tidak didaftarkan, `<i>` kehilangan kulitnya dan jatuh menjadi teks biasa.

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// daftar wing bersama-sama membangun pengetahuan skema, command, dan assembler — itulah `registry`
const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
