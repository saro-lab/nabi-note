---
title: Membuat mark inline
description: place 'mark' — format yang dikenakan di atas huruf. Menulis jalan keluar (toHtml) dan jalan masuk (claim) bersamaan.
---

# Membuat mark inline

`place: 'mark'` adalah **format yang dikenakan di atas huruf.** Tidak menempati
ruang, tidak memutus alur tulisan, dan bisa bertumpuk — bold, italic, highlight
semuanya jenis ini.

---

## Satu mark yang lengkap

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),
    button: {
      group: 'emphasis',
      label: { id: 'Pintasan' },
      shortcut: 'K',
      action: { kind: 'mark' },        // toggle dilakukan core — command tidak perlu ditulis
    },
    styles: `.nabi-content kbd {
      font-family: var(--nabi-font-mono, monospace);
      border: 1px solid var(--nabi-line); border-radius: .25em; padding: 0 .3em;
    }`,
  }),
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

Yang diisikan `simpleMark` ada dua — `place: 'mark'` dan
`escapeKeys: ['Escape']`. Selainnya diteruskan apa adanya.

---

## Kedua arah ditulis terpisah

| | Arah | Jika tidak ada |
|---|---|---|
| `toHtml` | Dokumen → HTML | **Registrasi mati.** Wing yang membangun node harus punya cara menggambar |
| `claim` | HTML → Dokumen | Tetap tergambar, tapi **tidak bisa dibaca ulang.** Begitu disimpan lalu dimuat, kulitnya terlucuti |

Enam mark bawaan (`b`·`i`·`u`·`s`·`sub`·`sup`) dan empat mark nilai
(`hl`·`tc`·`fs`·`tf`) — **core sudah mengenal tagnya.** Karena itu `boldWing`
tidak punya `toHtml` maupun `claim`. Nama yang Anda buat sendiri tidak dikenal
core, jadi keduanya harus ditulis.

### `toHtml`

```ts
toHtml: (node, children, ctx) => ctx.element('kbd', children())
```

| Argumen | Apa itu |
|---|---|
| `node` | Node saat ini. Atributnya diambil lewat `node.a?.['kunci']` |
| `children()` | Huruf hasil gambar isinya. **Digambar hanya saat dipanggil**, jadi jika tidak dipanggil isinya tidak keluar |
| `ctx` | Alat untuk membangun dengan aman |

Yang diberikan `ctx`:

| | |
|---|---|
| `ctx.element(tag, inner, attrs?)` | Membangun satu elemen. Nilainya otomatis di-escape |
| `ctx.escape(text)` | Hanya meng-escape huruf |
| `ctx.url(raw)` · `ctx.src(raw)` | Menyaring alamat. Alamat yang tidak bisa dipercaya jadi **`null`** |
| `ctx.keys` | Apakah ini sedang dirangkai **untuk editor** (`getEditorHtml()`) |

::: warning Jangan menyambung huruf secara langsung
Menulis seperti `` `<kbd>${node.a?.['t']}</kbd>` `` membuat huruf di dalam
dokumen langsung menjadi markup. Selalu lewati `ctx.element` atau `ctx.escape`.
:::

### `claim`

```ts
claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null)
```

| | |
|---|---|
| `el` | `{ kind, tag, attrs, children }` — elemen persis seperti yang masuk |
| `inner(block)` | Membaca isinya. `false` jika mark (posisi huruf), `true` jika blok |
| Jawaban | Array node, atau **`null`** (bukan milik saya → ke wing berikutnya) |

Ditanyakan sesuai urutan array wing, dan **wing pertama yang mengangkat
tangan** yang mengambilnya.

Ada dua tempat menjawab `null` — saat bukan tag saya, dan saat **tag saya tapi
nilainya di luar daftar.** Untuk yang kedua, jika menjawab `inner(false)` hanya
kulitnya yang dilucuti dan tulisannya tetap hidup.

---

## Mark yang menyimpan nilai

Mark yang **memilih satu dari daftar yang sudah ditentukan** seperti warna,
ukuran, memakai `valueMark`.

```ts
import { valueMark, type Wing } from 'nabi-note'

const LEVELS = ['low', 'mid', 'high'] as const

const riskWing: Wing = {
  ...valueMark({
    w: 'risk',
    key: 'v',                        // kolom atribut tempat nilai hidup
    values: [...LEVELS],             // nilai di luar ini tidak diterima
    toHtml: (node, children, ctx) =>
      ctx.element('span', children(), { 'data-risk': String(node.a?.['v'] ?? '') }),
  }),
  claim: (el, inner) => {
    if (el.tag !== 'span') return null
    const v = el.attrs['data-risk']
    if (v === undefined) return null
    if (!LEVELS.includes(v as typeof LEVELS[number])) return inner(false)   // di luar daftar — sisakan tulisannya saja
    return [{ w: 'risk', a: { v }, ch: inner(false) }]
  },
}
```

Dua hal yang diisikan `valueMark`:

- **`currentValue`** — nilai di posisi kursor sekarang berada. Toolbar dan
  baris konteks mewarnai kolom mana yang sedang ditekan berdasarkan jawaban
  ini.
- **`repair`** — memeriksa ulang nilainya di pintu masuk JSON. Jika di luar
  daftar atau tidak ada, jawab `null` untuk **melucuti sekaligus kulitnya.**
  Nilai simpanan yang diedit tangan pun tertangkap di sini.

::: tip Command untuk mengganti nilai
Command "ganti ke nilai ini" untuk mark bernilai belum punya pembantu publik.
Menyalakan/mematikan hanya dengan tombol toolbar lewat `action: { kind: 'mark' }`
tetap bisa dipakai, dan jika perlu memilih nilai, untuk sekarang pakailah salah
satu dari empat mark nilai bawaan (highlight · warna huruf · ukuran huruf ·
jenis huruf) atau sebar deklarasinya sendiri.
:::

---

## `escapeKeys` — keluar dari mark

Saat kursor berdiri di ujung mark, hanya pengguna yang tahu apakah huruf
berikutnya masuk atau keluar dari mark. `escapeKeys` adalah pintunya.

```ts
escapeKeys: ['Escape']    // nilai bawaan simpleMark · valueMark
```

**Kursor tidak berpindah.** Menekan tombol ini memasang reservasi "huruf
berikutnya yang diketik akan keluar dari mark ini." Setelah satu huruf
diketik, reservasi terpakai lalu hilang.

```
<kbd>Ctrl</kbd>(kursor)  →  Escape  →  ketik "+"  →  <kbd>Ctrl</kbd>+
```

Beberapa wing boleh memasang tombol yang sama — reservasi hanya terpasang
saat kursor benar-benar berada di dalam mark itu, jadi di antara mark yang
bertumpuk hanya yang relevan yang sama-sama terlepas. <kbd>Escape</kbd> juga
dipakai untuk **membatalkan** reservasi yang sudah terpasang.

---

## Mark tidak bisa punya tombol

Menulis `onKey` pun **tidak akan pernah dipanggil untuk mark.** Posisi kursor
adalah `{ path, offset }` dan ujung `path` adalah **wadah penampung huruf** —
mark adalah node inline di dalam wadah itu sehingga tidak pernah muncul di
jalur. Saat menentukan pemilik tombol, core menyusuri jalur ini ke atas
sehingga tidak akan pernah bertemu mark.

Alasannya adalah tumpang tindih. Saat <kbd>Enter</kbd> ditekan di dalam
tautan di dalam italic di dalam bold, tidak ada cara menentukan siapa di
antara ketiganya yang jadi pemilik. Satu-satunya pintu yang dimiliki mark
untuk urusan tombol adalah `escapeKeys`.

---

## Dokumen berikutnya

- [Blok dan atribut paragraf](../custom/block) — yang menempati ruang
- [Tombol, transformasi otomatis, tempel](../custom/input) — `onKey` dan `inputRules`
- [UI dan aksi](../custom/ui) — tombol toolbar dan baris konteks

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
