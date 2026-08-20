---
title: Stabilo
---

# Stabilo

## Penjelasan

`highlightWing` (bernama `hl`) adalah pemilik (claim) dari `<mark data-color="...">`. Karena ia
tanda inline yang membawa nilai, ia bukan toggle yang dinyalakan dan dimatikan
melainkan sebuah pilihan warna — sejenis dengan warna teks.

- **Tombol di bilah alat (pintasan `H`) memasang warna kuning** — mengirim
  `{ c: 'yellow' }` ke `setHighlight`. Ini bukan tombol yang berjalan tanpa argumen.
- Karena itu, toggle tombol ini adalah **toggle untuk warna kuning**. Rentang yang
  dipilih hanya dilepas stabilonya jika **seluruhnya sudah kuning** — pada rentang
  yang seluruhnya hijau, menekannya justru mengganti warna menjadi kuning, dan harus
  ditekan sekali lagi untuk dilepas.
- Ketika karet berada di dalam tanda stabilo, enam contoh warna (swatch) muncul di
  bilah alat konteks — menekannya mengubah warnanya saja di tempat. Tombol "hapus"
  tersendiri tidak ada pada sayap ini. Menekan warna yang sama sekali lagi melepas
  stabilonya, dan menghapus format sepenuhnya adalah urusan `clearFormatWing`
  (yang harus didaftarkan terpisah).
- **Ketika hanya karet yang ditaruh (tanpa memilih huruf), ada dua cabang.** Jika
  karet sudah berada di dalam tanda stabilo, seluruh simpul tanda itu menjadi
  sasarannya (rentangnya tidak perlu dipilih ulang). Jika di luar tanda, tidak ada
  huruf untuk dipasangi warna, sehingga tetap **dicadangkan** — huruf berikutnya yang
  diketik akan memakai warna itu.
- Pada nilai tersimpan hanya nama warnanya yang tersisa — seperti
  `data-color="yellow"`. `style` inline tidak ikut keluar. Warna latar sebenarnya
  digambar oleh lembar gaya yang dibawa sayap ini lewat `styles` (satu lembar gaya
  dipakai bersama dengan warna teks), dan nilai warnanya sendiri berasal dari token
  inti `--nabi-hl-*` — host bisa menimpa token itu.
- **Nilai di luar daftar tidak pernah hidup di mana pun.** Command sama sekali tidak
  berjalan, dan pada HTML yang masuk, `<mark>` dengan `data-color` di luar daftar
  kulitnya dilepas hingga **hanya hurufnya yang tersisa.** `<mark>` tanpa
  `data-color` sama sekali pun begitu juga — karena warna itu sendiri adalah
  nilainya, stabilo tanpa nilai tidak punya tempat berdiri.
- Nilai tersimpan yang diubah dengan tangan pun sama — saat `repair` menemukan nilai
  di luar daftar, simpul itu dilepas beserta kulitnya.

| Nama warna | Nilai tersimpan |
|---|---|
| Kuning | `yellow` |
| Hijau | `green` |
| Biru muda | `cyan` |
| Merah muda | `pink` |
| Ungu | `purple` |
| Oranye | `orange` |

Keenam warna ini diekspor sebagai `HIGHLIGHT_COLORS` — bukan nilai warna, melainkan
**larik nama** (`readonly string[]`). Nilai warnanya sendiri dibawa oleh lembar gaya.

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, highlightWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// daftar wing bersama-sama membangun pengetahuan skema, command, dan assembler — itulah `registry`
const { nabi, registry } = createNabiWith([highlightWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/highlight" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
