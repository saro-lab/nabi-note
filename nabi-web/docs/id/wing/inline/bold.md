---
title: Tebal
---

# Tebal

## Penjelasan

`boldWing` adalah pemilik (claim) dari `<b>`. Pilih beberapa huruf lalu tekan **B**
di bilah alat, atau pasang lewat mode petunjuk (tekan Shift dua kali cepat lalu `B`),
dan rentang itu menjadi tebal.

- Saat masuk, `<b>` dan `<strong>` sama-sama diakui; saat keluar, semuanya selalu
  keluar sebagai satu `<b>`. Tidak satu pun atribut dipertahankan — `class`, `style`,
  dan `data-*` berguguran, yang tersisa hanya tagnya.
- Pintasan mode petunjuk adalah `B`, pintasan akselerator adalah `Ctrl`/`⌘`+`B`
  (`mod+b`).
- Menekannya sementara huruf terpilih berarti toggle (`toggleMark`) — jika seluruh
  rentang sudah tebal, ketebalannya dilepas; jika belum, ketebalan dipasang. Wing
  ini tidak punya command sendiri — tombolnya memakai `action: { kind: 'mark' }`
  sehingga langsung memanggil `toggleMark` milik core.
- Jika tidak didaftarkan, `<b>` kehilangan kulitnya dan jatuh menjadi teks biasa
  (semua tag yang tidak terdaftar berakhir seperti ini — itu aturan nabi secara
  keseluruhan).

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// daftar wing bersama-sama membangun pengetahuan skema, command, dan assembler — itulah `registry`
const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
