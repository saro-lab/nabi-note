---
title: Garis bawah
---

# Garis bawah

## Penjelasan

`underlineWing` adalah pemilik (claim) dari `<u>`.

- Satu-satunya tag yang diakui adalah `<u>`. Saat keluar pun selalu `<u>` dan tidak
  satu pun atribut dipertahankan. **`<ins>` tidak diterima** — kulitnya dilepas dan
  yang tersisa hanya hurufnya. Ini bukan tanda yang menerima pasangan tag seperti
  tebal (`<b>`·`<strong>`) atau coret (`<s>`·`<strike>`·`<del>`).
- Pintasan mode petunjuk adalah `U`, pintasan akselerator adalah `Ctrl`/`⌘`+`U`
  (`mod+u`).
- Menekannya sementara huruf terpilih berarti toggle.
- Jika tidak didaftarkan, `<u>` kehilangan kulitnya dan jatuh menjadi teks biasa.
- Garis bawah dan tautan dapat tampak serupa di layar, tetapi keduanya adalah tanda
  terpisah yang dimiliki sayap yang berbeda (`a`) — keduanya bisa dipasang pada huruf
  yang sama.

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// daftar wing bersama-sama membangun pengetahuan skema, command, dan assembler — itulah `registry`
const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
