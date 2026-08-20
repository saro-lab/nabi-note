---
title: Subskrip
---

# Subskrip

## Penjelasan

`subscriptWing` adalah pemilik (claim) dari `<sub>`. Dipakai untuk rumus kimia atau
nomor yang ditulis turun ke bawah.

- Tag yang diakui hanya satu: `<sub>`. Atribut tidak dipertahankan.
- Tidak ada pintasan mode petunjuk maupun akselerator. Kelompok bilah alatnya adalah
  `script`, berdampingan dengan superskrip (superskrip lebih dulu sesuai urutan
  pendaftaran).
- Menekannya sementara huruf terpilih berarti toggle.
- Tampilannya berasal dari lembar gaya yang dibawa wing ini lewat `Wing.styles`.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sub { vertical-align: sub; }
```

**Lembar gaya ini satu set yang dipakai bersama superskrip.** Kedua wing sama-sama
membawa huruf yang sama, jadi meski keduanya didaftarkan, dokumen hanya memuatnya
**satu kali** (`collectSheets` menyaring lembar gaya yang sama pada dokumen yang
sama). Pada nilai tersimpan (HTML) yang tersisa hanya tag `<sub>`; gayanya sendiri
tidak ikut terbawa.

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// daftar wing bersama-sama membangun pengetahuan skema, command, dan assembler — itulah `registry`
const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
