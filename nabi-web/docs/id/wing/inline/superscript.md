---
title: Superskrip
---

# Superskrip

## Penjelasan

`superscriptWing` adalah pemilik (claim) dari `<sup>`. Dipakai untuk pangkat pada
satuan atau untuk nomor catatan kaki.

- Tag yang diakui hanya satu: `<sup>`. Atribut tidak dipertahankan.
- Tidak ada pintasan mode petunjuk maupun akselerator (ia salah satu sayap yang tidak
  memunculkan lencana, seperti unggah berkas). Kelompok bilah alatnya adalah `script`,
  berdampingan dengan subskrip, tetapi sesuai urutan pendaftaran superskrip inilah
  yang lebih dulu.
- Menekannya sementara huruf terpilih berarti toggle.
- Tampilannya berasal dari lembar gaya yang dibawa wing ini lewat `Wing.styles`.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sup { vertical-align: super; }
```

**Lembar gaya ini satu set yang dipakai bersama subskrip.** Kedua wing sama-sama
membawa huruf yang sama, jadi meski keduanya didaftarkan, dokumen hanya memuatnya
**satu kali** (`collectSheets` menyaring lembar gaya yang sama pada dokumen yang
sama). Pada nilai tersimpan (HTML) yang tersisa hanya tag `<sup>`; gayanya sendiri
tidak ikut terbawa.

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, superscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// daftar wing bersama-sama membangun pengetahuan skema, command, dan assembler — itulah `registry`
const { nabi, registry } = createNabiWith([superscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/superscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
