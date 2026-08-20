---
title: Warna teks
---

# Warna teks

## Penjelasan

`textColorWing` (bernama `tc`) adalah pemilik (claim) dari `<span data-color="...">`. Ia sejenis
dengan stabilo: karena ia tanda inline yang membawa nilai, ia tidak dinyalakan dan
dimatikan melainkan memilih warna.

- **Tombol di bilah alat (pintasan `C`) memasang warna hijau** — mengirim
  `{ c: 'green' }` ke `setTextColor`. Ini bukan tombol yang berjalan tanpa argumen.
- Karena itu, toggle tombol ini adalah **toggle untuk warna hijau**. Rentang yang
  dipilih hanya dilepas jika seluruhnya sudah hijau; jika warna lain terpasang, warna
  itu diganti menjadi hijau.
- Ketika karet berada di dalam tanda warna teks, lima contoh warna (swatch) muncul di
  bilah alat konteks — menekannya mengubah warnanya saja di tempat (tandanya tidak
  bertumpuk berlapis). Tombol "hapus" tersendiri tidak ada pada sayap ini — menekan
  warna yang sama sekali lagi melepasnya, dan selebihnya urusan `clearFormatWing`.
- **Ketika hanya karet yang ditaruh (tanpa memilih huruf), ada dua cabang.** Jika
  di dalam tanda, seluruh simpul tanda itu menjadi sasarannya; jika di luar tanda,
  tetap **dicadangkan** — huruf berikutnya yang diketik akan memakai warna itu.
- Pada nilai tersimpan hanya nama warnanya yang tersisa — seperti
  `data-color="green"`. `style` inline tidak ikut keluar. Nilai warnanya berasal
  dari token inti `--nabi-tc-*`, dan lembar gayanya dipakai bersama dengan stabilo.
- Saat masuk (`claim`), yang dilihat hanya elemen yang bertag `<span>` sekaligus
  memiliki atribut `data-color`. `<span>` yang sama sekali tidak punya `data-color`
  tidak diklaim oleh sayap ini, sehingga kulitnya dilepas dan jatuh menjadi teks
  biasa. **Jika atributnya ada tetapi nilainya di luar daftar, kulitnya tetap
  dilepas hingga hanya hurufnya yang tersisa.**
- Nilai tersimpan yang diubah dengan tangan pun sama — di luar daftar berarti
  `repair` melepas simpul itu beserta kulitnya.
- Karena ia tanda yang berbeda dari stabilo, keduanya bisa dipasang bersama pada huruf
  yang sama — itu sebabnya lembar gaya stabilo tidak menuliskan `color`.

| Nama warna | Nilai tersimpan |
|---|---|
| Hijau | `green` |
| Koral | `coral` |
| Ungu | `violet` |
| Ambar | `amber` |
| Biru | `blue` |

Kelima warna ini diekspor sebagai `TEXT_COLORS` — bukan nilai warna, melainkan
**larik nama** (`readonly string[]`).

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// daftar wing bersama-sama membangun pengetahuan skema, command, dan assembler — itulah `registry`
const { nabi, registry } = createNabiWith([textColorWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/text-color" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
