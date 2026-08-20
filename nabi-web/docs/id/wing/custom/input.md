---
title: Tombol, transformasi otomatis, tempel
description: Mencegat tombol dengan onKey, membuat format hanya dari huruf dengan inputRules, menyentuh layar dengan attach.
---

# Tombol, transformasi otomatis, tempel

Ada tiga pintu bagi wing untuk menerima gestur manusia — **tombol** (`onKey`),
**huruf** (`inputRules`), **layar** (`attach`).

---

## Jalan yang dilalui tombol

Saat <kbd>Enter</kbd> ditekan, ditanyakan dalam urutan ini. Jika salah satu di
depan sudah menanganinya, yang di belakang tidak akan dipanggil.

```
① Pintasan toolbar     didengar di mana saja (seperti Ctrl+B)
② Transformasi otomatis inputRules — hanya Enter · Space
③ onKey milik wing      ke pemilik tempat kursor berada
④ Membidik benda        backspace di awal paragraf → memilih benda di depannya secara utuh
⑤ Aturan core           membelah paragraf · menghapus · langkah kursor
⑥ Browser               hanya jika sampai di sini tidak ada yang mengambil
```

---

## `onKey` — mencegat tombol

```ts
import type { OnKey } from 'nabi-note'

const noteKeys: OnKey = (intent, doc, sel, env, owner) => {
  if (intent.key !== 'backspace') return null      // bukan urusan saya — serahkan ke core
  if (sel.focus.offset !== 0) return null
  const first = [...owner.path, 0]
  if (first.length !== sel.focus.path.length) return null
  if (!first.every((v, i) => v === sel.focus.path[i])) return null
  return toggleNote(doc, sel, {}, env)             // backspace di awal sel pertama — membentangkan note
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
  commands: { toggleNote },
  onKey: noteKeys,
}
```

| Argumen | Apa itu |
|---|---|
| `intent` | `{ key, dir? }` — tombol apa itu |
| `doc` · `sel` · `env` | Sama seperti yang diterima command |
| `owner` | `{ path, node }` — **node yang terpilih sebagai pemilik saya** |

Jawabannya `{ doc, selection }` seperti command, atau **`null`**. `null`
berarti "tidak diambil," sehingga core yang melanjutkan — jika syaratnya tidak
cocok, wajib menjawab `null`.

### Tombol yang masuk

| `intent.key` | Kapan |
|---|---|
| `'enter'` | Keduanya, <kbd>Enter</kbd> **dan** <kbd>Shift</kbd>+<kbd>Enter</kbd> |
| `'tab'` · `'shiftTab'` | <kbd>Tab</kbd> · <kbd>Shift</kbd>+<kbd>Tab</kbd> |
| `'backspace'` · `'delete'` | Kedua jenis penghapusan |
| `'arrow'` | Panah. Arahnya di `intent.dir` (`'left'`·`'right'`·`'up'`·`'down'`) |

Tombol huruf tidak dikirim. Huruf diketik browser dan diterima core.

### Pemiliknya hanya satu

**Node pertama bukan-paragraf yang ditemui saat jalur kursor disusuri ke
atas** — wing yang memiliki node itulah pemiliknya.

```
Kursor di jalur [1, 0, 0]                  Kandidat pemilik
  [1, 0, 0]  →  p        dilewati karena paragraf
  [1, 0]     →  note     ← ini pemiliknya
  [1]        →  p(pembungkus)  tidak sampai ke sini
```

Karena itu **wadah paling dalam yang menang** — <kbd>Tab</kbd> di dalam daftar
yang berada dalam tabel diterima oleh daftar. Part (`parts`) juga bisa jadi
pemilik, dan saat itu `owner.node` adalah node part tapi `onKey` yang dipanggil
tetap milik wing yang mendeklarasikannya. Karena itu, memilah lebih dulu apa
yang terpilih lewat `owner.node.w` adalah kebiasaan yang lazim.

Mark tidak bisa jadi pemilik — [alasannya ada di dokumen inline](./inline#mark-tidak-bisa-punya-tombol).

---

## `inputRules` — membuat hanya dari huruf

Inilah yang membuat mengetik `# ` menjadi judul dan `> ` menjadi kutipan.

```ts
inputRules: [
  { trigger: 'space', pattern: /^>$/, run: () => ({ name: 'toggleQuote' }) },
]
```

| Kolom | |
|---|---|
| `trigger` | `'space'` atau `'enter'` — dicek **tepat saat** tombol ini ditekan |
| `pattern` | Regex. `run` menerima hasil kecocokannya |
| `run` | `{ name, args? }` — command yang akan dijalankan |
| `scope` | `'block'`(bawaan) atau `'word'` |

### `'block'` — mengganti awal baris

Melihat **awal baris** di depan kursor. Jika cocok, awal baris itu (beserta
huruf pemicunya) dihapus lalu command dijalankan.

```
Ketik "> "   →   ">" terhapus dan toggleQuote berjalan
```

Hanya berlaku pada **baris pertama** paragraf. Tidak berlaku pada baris
berikutnya setelah turun baris dengan <kbd>Shift</kbd>+<kbd>Enter</kbd> —
mencegah format muncul tiba-tiba di tengah tulisan yang sedang berjalan.

### `'word'` — dikenakan pada satu kata

Melihat **satu kata** di depan kursor. Jika cocok, kata itu dipilih lalu
command dijalankan, dan kursor dikembalikan ke tempatnya semula. Tulisannya
tidak dihapus — inilah jalur untuk aturan yang mengenakan mark.

Jika kata itu **sudah mengenakan mark wing ini,** dilewati. Tidak berlaku dua
kali di tempat yang sama.

### Aturan bersama

- Hanya berjalan saat kursor **terkatup.** Memilih rentang lalu menekan spasi
  tidak berlaku.
- Hanya berjalan di paragraf biasa — tidak berlaku di paragraf pembungkus yang
  memuat benda.
- Diperiksa sesuai urutan array wing, dan **aturan pertama yang berhasil**
  yang menang.
- Jika command menjawab `null` (= tidak ada yang perlu dilakukan), **dibatalkan
  dan lanjut ke aturan berikutnya.** Jejak transformasi otomatis yang gagal
  tidak tertinggal di dokumen.

---

## `attach` — menyentuh layar

Ada kalanya bukan mengubah dokumen, melainkan **peristiwa yang terjadi di
layar** yang perlu didengar — memilih sel tabel dengan drag, mewarnai kode,
menekan segitiga pada details.

```ts
import type { Attach } from 'nabi-note'

const attachNote: Attach = (host) => {
  const onClick = (ev: MouseEvent): void => { /* … */ }
  host.root.addEventListener('click', onClick)
  return () => host.root.removeEventListener('click', onClick)   // jawab fungsi pelepasnya
}
```

Ada tiga hal yang diberikan `host`.

| | |
|---|---|
| `host.root` | Elemen permukaan edit |
| `host.nabi` | Editornya. Jika perlu mengubah dokumen, lakukan lewat **command** |
| `host.pathOfKey(id)` | Memindahkan `data-key` di layar ke jalur dokumen |

`mountSurface` memasang `attach` semua wing yang terdaftar sekaligus, dan
memanggil fungsi pelepas yang dijawab saat dilepas. **Inilah satu-satunya
tempat kode yang mengenal DOM boleh hidup** — jangan menyentuh `document` di
dalam command · `toHtml` · `repair`.

::: tip Mencari dokumen lewat `data-key`
Perangkaian untuk editor (`getEditorHtml()`) menempelkan `data-key` di setiap
node. Cari `[data-key]` terdekat dari elemen yang ditekan, lalu berikan ke
`host.pathOfKey()` untuk mendapatkan posisinya dalam dokumen.
:::

---

## Tempel dan HTML awal

Tempel · `setHtml()` · memuat nilai simpanan — **semuanya melewati pintu yang
sama.** Yang perlu dilakukan wing di sini hanya `claim` —
tertulis di [dokumen inline pada `claim`](./inline#claim).

```
Tempel      ─┐
setHtml     ─┼→ parsing → claim milik wing → pemetaan tag bawaan core → repair → cocoon → dokumen
HTML awal   ─┘
```

Jika tidak ada `claim`, **tag itu terlucuti kulitnya dan hanya tulisan di
dalamnya yang tersisa.** Berkat aturan ini, markup asing yang disalin dari
editor lain tidak ikut tertanam apa adanya dalam dokumen.

Jalan masuk lewat JSON (`setJson()`) bukan tag melainkan node, jadi bukan
`claim` melainkan `repair` yang menjadi penjaga pintunya.

---

## Dokumen berikutnya

- [UI dan aksi](../custom/ui) — tombol toolbar dan baris konteks
- [Mark inline](../custom/inline) · [Blok dan atribut paragraf](../custom/block)

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
