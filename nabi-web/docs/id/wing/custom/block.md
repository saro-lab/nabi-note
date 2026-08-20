---
title: Membuat blok dan atribut paragraf
description: void · container · attr — membuat sesuatu yang menempati ruang. Benda selalu hidup di dalam paragraf pembungkus.
---

# Membuat blok dan atribut paragraf

Yang menempati ruang terbagi tiga jenis.

| `place` | Apa | Contoh |
|---|---|---|
| `'void'` | **Benda tanpa isi.** Kursor tidak bisa masuk ke dalamnya | Garis horizontal · gambar · YouTube |
| `'container'` | **Benda yang berisi tulisan** | Kutipan · details · tabel · daftar · kode |
| `'attr'` | Nilai yang menempel pada paragraf itu sendiri. Tidak membangun node | Judul · perataan · drop cap |

---

## Benda hidup di dalam paragraf pembungkus

Dokumen adalah **array blok** dan yang boleh berdiri di tingkat teratas hanyalah
paragraf (`p`). Benda tidak berdiri langsung di tingkat teratas, melainkan
mengenakan **satu paragraf yang hanya berisi dirinya sendiri**.

```json
[{ "w": "p", "ch": [{ "w": "hr", "ch": [] }] }]
```

Paragraf ini adalah **paragraf pembungkus**, dan di layar digambar sebagai
`<div data-nabi-p>`.

Ada dua alasan melakukan ini. Selalu ada tempat kursor berdiri di depan dan
belakang benda (karena satu paragraf selalu ada di sana), dan **benda ikut
menerima atribut paragraf seperti perataan** — "gambar rata tengah" pada dasarnya
adalah "gambar di dalam paragraf yang rata tengah".

---

## Membuat benda tanpa isi

```ts
import { boxObject, createNabiWith, insertLump, type Command, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const insertStar: Command = (doc, sel, _args, env) => {
  const r = insertLump(doc, sel.focus, { w: 'star', ch: [] }, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const starWing: Wing = {
  ...boxObject({
    w: 'star',
    toHtml: (_node, _children, ctx) => ctx.element('hr', '', { 'data-nabi-star': '' }),
  }),
  commands: { insertStar },
  button: {
    group: 'insert',
    label: { id: 'Bintang' },
    action: { kind: 'command', command: 'insertStar' },
  },
}
```

`insertLump` yang secara otomatis mengenakan paragraf pembungkusnya.

```
<div data-nabi-p><hr data-nabi-star/></div>
```

Jika dipanggil di atas paragraf kosong, **paragraf itu langsung ditukar** —
sehingga tidak menyisakan satu baris kosong setiap kali dimasukkan. Dan perataan
yang sudah dimiliki paragraf itu tetap bertahan.

Yang diisikan `boxObject` adalah `place: 'void'` dan **pemeriksa atribut**.

```ts
boxObject({
  w: 'stamp',
  attrs: { c: (v) => (v === 'red' || v === 'blue' ? v : null) },   // nilai di luar daftar jatuh
  requires: ['c'],                                                 // tanpa ini, benda ini tidak berdiri
  toHtml: /* … */,
})
```

Atribut yang tidak ditulis di `attrs` **jatuh seluruhnya karena dianggap kolom
tak dikenal.** Tidak ada celah bagi nilai di luar kontrak untuk menyelinap masuk
ke nilai simpanan.

---

## Membuat benda yang berisi

`place: 'container'` harus selalu disertai `holds` — jika tidak ditulis,
registrasi mati.

```ts
import { createNabiWith, toggleWrap, type Command, type Wing } from 'nabi-note'

const toggleNote: Command = (doc, sel, _args, env) => {
  const r = toggleWrap(doc, sel, 'note', env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',                  // di dalamnya hidup paragraf (kalau 'inline' hanya huruf)
  allows: ['p'],                    // yang boleh masuk ke dalam ini
  toHtml: (_node, children, ctx) => ctx.element('aside', children(), { 'data-nabi-note': '' }),
  claim: (el, inner) => (el.tag === 'aside' ? [{ w: 'note', ch: inner(true) }] : null),
  commands: { toggleNote },
  inputRules: [{ trigger: 'space', pattern: /^!$/, run: () => ({ name: 'toggleNote' }) }],
  button: {
    group: 'container',
    label: { id: 'Catatan' },
    action: { kind: 'command', command: 'toggleNote' },
  },
}
```

`toggleWrap` adalah sebuah **toggle**. Ia membungkus blok-blok teratas yang
tercakup seleksi dengan wadah ini, dan jika sudah terbungkus semuanya, ia
membentangkan kembali isinya di tempat.

```
Sebelum dibungkus  [p"baris pertama", p"kedua"]
Setelah dibungkus  [p[ note[ p"baris pertama", p"kedua" ] ]]
Ditekan lagi       [p"baris pertama", p"kedua"]
```

### `holds`

| | Yang hidup di dalamnya | Contoh |
|---|---|---|
| `'blocks'` | Paragraf dan benda lain | Kutipan · details · sel tabel |
| `'inline'` | Hanya huruf dan mark | Baris ringkasan details · kode |

### `allows`

Jika ditulis, **yang di luar itu tidak bisa masuk.** Core secara otomatis
memasang pembersih — baik dari tempel maupun nilai simpanan, apa pun di luar
daftar akan dilucuti kulitnya dan hanya tulisannya yang diturunkan menjadi
paragraf.

Jika tidak ditulis, semua diizinkan. Jika `allows` diisi nama yang tidak
dikenal, **mati tepat di tempat registrasi.**

---

## `parts` — struktur dalam tanpa tombol

Struktur seperti baris/sel tabel, baris ringkasan details, yang **tidak bisa
berdiri sendiri dan tidak punya tombol toolbar** dideklarasikan sebagai part.

```ts
const detailsWing: Wing = {
  w: 'details',
  place: 'container',
  holds: 'blocks',
  boolAttrs: ['o'],                                   // atribut yang nilainya hanya 1 — status terbuka
  parts: { summary: { holds: 'inline' } },            // baris ringkasan
  toHtml: /* … */,
  partHtml: { summary: /* … */ },                     // setiap part harus punya cara merangkainya
  repair: repairDetails,
}
```

Ada empat aturan.

- Part hanya boleh dimiliki oleh **container**. Ditulis di `place` lain,
  registrasi mati.
- Setiap part harus punya `partHtml`. Tanpa itu, registrasi mati.
- Nama part tidak boleh bertabrakan dengan nama wing atau nama part lain.
- Jika part perlu dirapikan, tulis di `partRepair` dengan nama part.

`StructureDecl` menerima tiga hal — `holds` · `singleParagraph` · `boolAttrs`.

### `singleParagraph`

Isinya **dipatok menjadi satu paragraf.** Sel tabel memakai ini — menekan
<kbd>Enter</kbd> di dalam sel tidak membelah paragraf menjadi dua, dan menghapus
seleksi yang mencakup dua sel tidak membuat kedua sel bergabung. Kolom inilah
yang menjaga grid tetap utuh.

### `boolAttrs`

Atribut yang nilainya hanya satu, yaitu `1` — `o`(terbuka) pada details,
`ck`(centang) pada daftar tugas, `dc`(drop cap) pada paragraf. Status mati
bukan `0`, melainkan **kolom itu tidak ada sama sekali.**

---

## `repair` — pintu terakhir di pintu masuk nilai simpanan

`repair` merapikan node ini sekali **tepat sebelum JSON menjadi dokumen.**

```ts
repair: (node) => {
  if (!benar(node)) return null    // null — node ini dilucuti sekaligus kulitnya
  return node_yang_dirapikan       // boleh tetap sama (jika objek yang sama dijawab, tidak berubah)
}
```

Nilai simpanan yang diedit tangan, dokumen dari versi lain, JSON buatan orang
lain, semuanya melewati pintu ini. Hanya yang lolos dari sini yang menjadi
dokumen, jadi **inilah satu-satunya tempat wing bisa menjamin sendiri bentuk
node-nya.**

Jika `allows` dan `repair` ditulis bersamaan, pembersihan `allows` berjalan
**lebih dulu** dan hasilnya diteruskan ke `repair`.

---

## `requiresAnyOf` — wing yang butuh pasangan agar bisa berdiri

```ts
requiresAnyOf: ['img', 'a']
```

Jika tidak satu pun dari ini ikut terdaftar, **mati tepat di tempat
registrasi.** Wing upload memakai ini — hasil unggahan harus bisa berdiri
sebagai gambar atau tautan, dan jika keduanya tidak ada, hasil unggahan itu
tidak bisa jadi apa-apa.

---

## Atribut paragraf (`place: 'attr'`)

Atribut paragraf tidak membangun node. Ia hanya menempelkan satu nilai pada
`a` milik paragraf.

```json
{ "w": "p", "a": { "h": 2, "a": "c" }, "ch": ["Judul 2 rata tengah"] }
```

::: warning Kolomnya dipatok menjadi tiga
`attrKey` harus salah satu dari tiga ini — **`h`(judul) · `a`(perataan) ·
`dc`(drop cap)** — dan menulis nama di luar itu membuat registrasi mati. Pada
versi sekarang, **atribut paragraf baru tidak bisa dibuat** — kolom atribut
paragraf ditutup hanya untuk tiga yang sudah diketahui core.

Dengan alasan yang sama, ketiganya sudah ditempati `headingWing`·`alignWing`·
`dropCapWing`, sehingga praktis tidak ada tempat lagi untuk menulis wing baru
dengan `place: 'attr'`. Jika ingin menempelkan nilai pada setiap paragraf,
untuk sekarang pilihlah cara membungkusnya dengan container.
:::

Ada dua kolom yang mengurus nilai.

| | |
|---|---|
| `attrValues` | Daftar nilai yang bisa diterima (untuk judul: `[1,2,3,4,5,6]`) |
| `currentValue` | Nilai yang sedang dimiliki paragraf ini. Toolbar dan baris konteks mewarnai kolom yang tertekan berdasarkan jawaban ini |

---

## Pembantu dokumen yang dipublikasikan

Ada empat pembantu edit yang diberikan versi sekarang ke luar.

| | Yang dikerjakan |
|---|---|
| `insertLump(doc, caret, lump, env, wrap?)` | Menegakkan satu benda beserta paragraf pembungkusnya |
| `removeLump(doc, topIndex, env)` | Membongkar seluruh satu paragraf pembungkus di tingkat teratas |
| `toggleWrap(doc, sel, containerW, env)` | Membungkus atau membentangkan blok-blok yang tercakup dengan wadah |
| `topNodeAt(doc, path)` | Node teratas tempat jalur ini berada |

Keempatnya menjawab `{ doc, caret }`, jadi command harus mengubahnya sekali ke
bentuk jawaban yang diharapkan.

```ts
return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
```

::: tip Jika perlu edit yang lebih halus dari ini
Pembantu internal untuk memotong dan menyambung per huruf (memasang mark,
menulis atribut paragraf, dan semacamnya) belum menjadi API publik. Sampai
saat itu, Anda boleh langsung membangun array `doc` yang baru dan
menjawabnya — dokumen yang dijawab tetap dihaluskan sekali lagi oleh `cocoon`,
jadi dokumen yang melanggar aturan tidak akan pernah bertahan.
:::

---

## Dokumen berikutnya

- [Tombol, transformasi otomatis, tempel](../custom/input) — `onKey` · `inputRules` · `attach`
- [UI dan aksi](../custom/ui) — tombol toolbar dan baris konteks

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
