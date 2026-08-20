---
title: Coret
---

# Coret

## Penjelasan

`strikeWing` adalah pemilik (claim) dari `<s>`. Dipakai untuk nilai yang sudah
dihapus tetapi ingin tetap ditinggalkan di tempatnya.

- Saat masuk, ketiganya — `<s>`, `<strike>`, dan `<del>` — diakui; saat keluar, selalu
  `<s>`. Tidak satu pun atribut dipertahankan — waktu pada `<del datetime="…">` pun
  tidak ikut tersisa.
- Pintasan pada mode petunjuk adalah `S`. **Tidak ada tombol pintas kombinasi** —
  berbeda dari tebal·miring·garis bawah yang satu golongan (`emphasis`) dengannya,
  kombinasi `Ctrl`/`⌘` tidak dipasang di sini.
- Menekannya sementara huruf terpilih berarti toggle.
- Jika tidak didaftarkan, `<s>` akan dilucuti kulitnya dan jatuh menjadi teks biasa.

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, strikeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar wing sekaligus membangun pengetahuan skema, perintah, dan perakit — itulah `registry`
const { nabi, registry } = createNabiWith([strikeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/strikethrough" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
