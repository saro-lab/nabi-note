---
title: Membuat wing sendiri
description: Format yang belum ada dibuat sebagai wing — isi satu kontrak, core mengurus sisanya.
---

# Membuat wing sendiri

Wing adalah **satu objek**. Tidak mewarisi kelas, tidak ada prosedur registrasi
terpisah — cukup memasukkannya ke array yang diberikan ke `createNabiWith` dan itu
sudah registrasi.

Bold, tabel, upload pun dibuat hanya dengan mengisi kolom-kolom di halaman ini. Wing
yang Anda buat sendiri berjalan dengan **syarat yang sama** seperti wing bawaan — tidak
ada jalan pintas.

---

## Wing terpendek

Satu mark inline yang mengenali `<kbd>`.

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // nama wing ini — `w` pada nilai simpanan adalah ini
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // gambar saat keluar
  }),
  // menyatakan diri sebagai pemilik `<kbd>` dari HTML yang masuk
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

Sekarang `<kbd>` bertahan di dalam dokumen. Ia tetap ada melewati tempel,
`setHtml()`, simpan, dan muat ulang.

```
Terdaftar     <p>Tekan: <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   tetap sama
Tak terdaftar <p>Tekan: <kbd>Ctrl</kbd></p>                →   <p>Tekan: Ctrl</p>
```

**Kedua kolom menghadap arah yang berbeda.** `toHtml` adalah jalan keluar dan `claim`
adalah jalan masuk. Jika `claim` tidak ditulis, penggambaran tetap jalan tetapi
**tidak bisa dibaca ulang** — begitu disimpan lalu dimuat lagi, kulitnya terlucuti.

`simpleMark` adalah jalan pintas untuk mark tanpa atribut. Untuk mark yang menyimpan
nilai ada `valueMark`, untuk benda ada `boxObject`, untuk jenis daftar ada
`listFamily`, dan selain itu objek `Wing` ditulis tangan.

---

## Wing adalah konstanta

**Kebanyakan wing sudah berupa konstanta jadi** — tinggal dimasukkan ke array
seperti `boldWing`, `headingWing`. Hanya dua yang punya opsi sehingga punya fungsi
pabrik sendiri.

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

Jika hanya ingin mengganti bagian "attach"-nya, konstanta itu tinggal disebar
(spread) — ini lebih sederhana karena bukan membangun wing baru, hanya mengganti
satu kolom.

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## Registrasi dan urutan

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**Urutan array adalah urutan pemindaian.** Saat menentukan pemilik suatu markup
(`claim`), core bertanya sesuai urutan ini, dan wing pertama yang menjawab yang
mengambilnya. Jika tidak ada yang mengambil, kulitnya terlucuti.

Di toolbar, **kelompok (`button.group`) yang diutamakan lebih dulu**. Urutan
kelompok sudah dipaku, dan di dalam kelompok yang sama barulah urutan array ini
berlaku.

### Mati tepat di tempat registrasi

`createNabiWith` **langsung melempar** wing yang melanggar kontrak. Tidak meledak
belakangan.

| Yang tertangkap | Contoh |
|---|---|
| Memakai kata cadangan sebagai nama | `w: 'p'` · `w: 'br'` |
| Mendaftarkan nama yang sama dua kali | `boldWing` dua kali |
| Membangun node tapi tanpa `toHtml` | `place: 'mark'` tanpa cara menggambar |
| Nama command melanggar aturan | Harus kata kerja+objek dalam camelCase (`insertTable`) |
| Pasangan yang diperlukan tidak ada | Upload harus disertai `img` atau `a` (`requiresAnyOf`) |

---

## Command — fungsi murni

Semua jalan yang mengubah dokumen melewati satu command. Command **tidak tahu DOM
maupun layar.**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // nilai dari luar, jadi diperiksa — kalau tidak cocok, tidak melakukan apa-apa
  if (typeof args['text'] !== 'string') return null
  const stamp = { w: 'stamp', a: { t: args['text'] }, ch: [] }
  const r = insertLump(doc, sel.focus, stamp, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

export const stampWing: Wing = {
  ...boxObject({
    w: 'stamp',
    attrs: { t: (v) => (typeof v === 'string' ? v : null) },
    toHtml: (node, _children, ctx) =>
      ctx.element('span', ctx.escape(String(node.a?.['t'] ?? '')), { 'data-nabi-stamp': '' }),
  }),
  commands: { insertStamp },
  button: {
    group: 'insert',
    label: { id: 'Stempel' },
    action: { kind: 'command', command: 'insertStamp', args: { text: 'Oke' } },
  },
}
```

| Argumen | Apa itu |
|---|---|
| `doc` | Dokumen saat ini (array blok). **Jangan diubah, jawab dengan yang baru** |
| `sel` | Seleksi saat ini |
| `args` | Nilai yang dikirim tombol atau baris konteks. **Nilai dari luar, jadi harus diperiksa** |
| `env` | Pengetahuan jenis — apa mengandung apa, apa yang berupa benda |

Jawabannya adalah `{ doc, selection }` atau **`null`**. **Jika tidak ada yang
berubah, jawab `null`** — dengan begitu `applyCommand` menjawab `false` dan tidak
ada titik undo yang tertumpuk. Dokumen yang dijawab masih dihaluskan sekali lagi
oleh `cocoon`, jadi command mana pun tidak bisa meninggalkan dokumen yang melanggar
aturan.

Yang memanggilnya selalu lewat nama.

```ts
nabi.applyCommand('insertStamp', { text: 'Oke' })   // boolean
```

---

## Semua kolom yang bisa diisi

`Wing` punya dua puluh lima kolom dan **yang wajib hanya dua** (`w`·`place`).

### Apa itu

| Kolom | Arti |
|---|---|
| `w` | Nama wing ini. Menjadi `w` pada nilai simpanan. Kata cadangan (`p`·`br`) tidak boleh dipakai |
| `place` | `'mark'` di atas huruf · `'void'` benda tanpa isi · `'container'` benda berisi tulisan · `'attr'` atribut paragraf · `'tool'` alat tanpa jejak di dokumen |
| `holds` | Bagaimana isinya ditampung — `'blocks'` atau `'inline'` |
| `singleParagraph` | Isinya dipatok menjadi **satu** paragraf (sel tabel) |
| `boolAttrs` | Nama-nama atribut boolean yang nilainya hanya `1` |
| `allows` | Nama-nama wing yang boleh masuk ke dalamnya. Jika tidak ditulis, semua boleh |
| `requiresAnyOf` | Salah satu dari ini harus ikut terdaftar |
| `parts` | Struktur tanpa tombol yang dibawa serta — baris/sel tabel, baris ringkasan pada details |

### Nilai

| Kolom | Arti |
|---|---|
| `attrKey` · `attrValues` | Nama kolom dan daftar nilai yang bisa diterima atribut paragraf |
| `currentValue` | Apakah sedang ditekan — toolbar dan baris konteks mewarnai kolom berdasarkan jawaban ini |

### Jalan bolak-balik

| Kolom | Arti |
|---|---|
| `toHtml` · `partHtml` | Gambar saat keluar |
| `claim` | Menentukan pemilik tag ini dari HTML yang masuk |
| `repair` · `partRepair` | Merapikan node ini di pintu masuk JSON. Jika jawab `null`, dilucuti sekaligus kulitnya |

### Tangan dan tombol

| Kolom | Arti |
|---|---|
| `commands` | Command-command yang ditambahkan wing ini |
| `onKey` | Mencegat tombol lebih dulu saat kursor berada di dalam node wing ini |
| `escapeKeys` | Tombol yang membuat huruf berikutnya keluar dari mark ini |
| `inputRules` | Transformasi otomatis yang terjadi hanya dari huruf |
| `attach` | Saat perlu menyentuh layar — drag sel tabel, pewarnaan kode adalah contohnya |

### Rupa

| Kolom | Arti |
|---|---|
| `button` · `buttons` | Satu atau beberapa tombol toolbar |
| `context` | Deklarasi baris konteks |
| `styles` | CSS yang dibawa wing ini |

---

## `w` — memberi nama

`w` adalah **huruf yang diulang pada setiap node dalam nilai simpanan**. Makin
pendek makin baik — itulah sebabnya wing bawaan memakai nama pendek seperti `b`·
`hl`·`tf`. Namun jika bertabrakan dengan nama orang lain, registrasi akan mati,
jadi untuk wing buatan sendiri pakailah nama yang agak lebih panjang tapi tidak
akan bertabrakan.

Tidak perlu sama dengan nama tag HTML — tag yang keluar ditentukan oleh `toHtml`.

::: warning Jika nama diganti belakangan
`w` pada nilai simpanan adalah nama itu sendiri, jadi mengganti nama berarti
**dokumen yang sudah tersimpan tidak bisa dibaca lagi.** Jika harus diganti,
sediakan masa transisi dengan menerima nama lama juga lewat `claim`.
:::

---

## Dokumen berikutnya

- [Mark inline](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [Blok dan atribut paragraf](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [Tombol, transformasi otomatis, tempel](./custom/input) — `onKey` · `inputRules` · `attach`
- [UI dan aksi](./custom/ui) — `button` · `context` · `styles`, dan bertanya pada pengguna

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
