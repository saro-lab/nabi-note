---
title: Dukungan SSR
description: Gambar dulu dokumen tersimpan di server, lalu sambungkan editor dan toolbar dengan hydrate.
---

# Dukungan SSR

## Tempat yang hanya menggambar dokumen tersimpan — tanpa menyalakan editor

Tempat yang hanya **menampilkan**, seperti daftar komentar, tidak butuh editor. Yang dibutuhkan
untuk menggambar dokumen hanyalah daftar wing yang terdaftar (`registry`), jadi ada pintu
tersendiri yang cuma menerima itu.

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// Sekali saja saat server dinyalakan — dipakai bersama untuk berapa pun dokumen tersimpan
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['Satu baris komentar'] }]   // NABI TREE dari database

renderStoredHtml(saved, registry)        // '<p>Satu baris komentar</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">Satu baris komentar</p>'
```

**`nabi-note/ssr` adalah entry point yang hanya membawa yang dibutuhkan untuk menggambar.** Tidak
menyentuh satu berkas pun dari permukaan edit (`surface`) dan alat layar (`ui`) — dijaga oleh
pengujian batas — sehingga kode DOM tidak ikut masuk ke bundel server. Pintu yang sama juga ada
di `nabi-note`, jadi halaman yang sudah memuat editor bisa memakai yang itu saja.

| | |
|---|---|
| `renderStoredHtml(json, registry, options?)` | HTML yang disimpan/diterbitkan — sama dengan `getHtml()` |
| `renderStoredEditorHtml(json, registry, options?)` | HTML editor — sama dengan `getEditorHtml()` (disertai `data-key`) |

- **Keduanya tidak memakai DOM** — berjalan langsung di server.
- **Kalau bukan NABI TREE, hasilnya `null`** — aturan penolakannya sama seperti `setJson()`
  (seluruh dokumen harus berupa array). Tidak melempar galat.
- **Tidak berbeda satu karakter pun dari nilai yang dikeluarkan editor.** Melewati langkah yang
  sama (normalisasi lalu perakitan), jadi penyaringan XSS-nya pun sama persis — sisi yang cuma
  menampilkan tidak lebih longgar disaring.
- `options` hanya punya `{ allowLocalUrls }` — artinya sama dengan opsi bernama itu di
  `createNabiWith`.

**Dokumen tersimpan yang sama selalu mendapat `data-key` yang sama.** Karena itu server bisa
menggambar editor lebih dulu dengan `renderStoredEditorHtml`, dan saat browser menyambungnya
dengan `hydrate`, layar tidak digambar ulang.

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

Kalau ada yang tidak cocok, bagian itu saja yang digambar ulang di tempat — server dan klien
cuma perlu memakai daftar wing yang sama.

::: tip Halaman depan situs ini adalah contohnya sendiri
Dokumen demo di halaman depan **digambar lebih dulu dengan `renderStoredEditorHtml` saat build**
dan ditanam ke halaman, lalu editor bangun di atasnya lewat `hydrate`. Karena itu teksnya sudah
terbaca sebelum kode editor tiba — tidak ada jeda kosong yang tiba-tiba terisi.
:::

---

## Toolbar juga bisa digambar lebih dulu

Baris tombol **tidak melihat dokumen.** Yang dilihat hanya daftar wing yang terdaftar, bahasa,
dan urutan grup, jadi hasilnya adalah **konstanta** — dipanggil sekali saat server menyala dan
teks itu dipakai terus. Tidak perlu dipanggil ulang setiap request.

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'id' })
// '<div class="nabi-group" data-group="font">...</div>'
```

Kirim teks ini apa adanya ke dalam wadah toolbar, dan di browser `mountToolbar` menggambarnya
lewat **fungsi yang sama**. Kalau barisnya sudah berdiri dan cocok, **tidak digambar ulang —
hanya disambungkan perilakunya.**

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning Tulis `class="nabi-toolbar-row"` pada wadahnya juga
Saat mengirim baris yang sudah digambar lebih dulu, kelas ini harus ada **sejak gambar pertama**.
Kalau tidak ada, core menambahkannya sendiri saat mount, dan margin kiri-kanan yang baru
terpasang saat itu membuat **baris tombol bergeser sekali ke samping.** Kalau host sudah
menuliskannya lebih dulu, core tidak menyentuhnya (core hanya melepas yang dipasang sendiri).

```html
<div class="nabi-toolbar-row">Baris yang sudah digambar</div>
```
:::

- **Tidak akan rusak meski tidak cocok** — kalau baris yang berdiri berbeda dari daftar wing
  sekarang, bagian itu digambar ulang di tempat. Yang hilang cuma nilai yang digambar lebih
  dulu; layarnya selalu benar.
- **Baris yang digambar lebih dulu ada dalam keadaan netral** — "tidak ada yang ditekan, tidak
  ada yang tersembunyi." Status ditekan (`aria-pressed`) dan sembunyi ditentukan oleh posisi
  kursor, yang tidak diketahui server. Kalau susunannya menyembunyikan tombol berdasar posisi
  kursor, beberapa tombol bisa menghilang setelah mount dan barisnya menyusut ulang.
- **Kirim ini hanya ke halaman yang menyalakan editor.** Halaman yang cuma menampilkan tidak
  punya toolbar, jadi tidak perlu menerima teks ini.

**Dua tombol pratinjau dan layar penuh memakai jalan yang sama.** Keduanya bukan wing, melainkan
bagian dari chrome, jadi tidak ikut dalam teks toolbar di atas — digambar terpisah dan dikirim ke
wadah tempat `mountViewTools` akan berdiri.

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'id' })
// '<span class="nabi-tools">...</span>'
```

::: tip Halaman depan situs ini adalah contohnya sendiri
Toolbar demo di halaman depan **digambar lebih dulu saat build dengan `renderToolbarHtml` dan
`renderViewToolsHtml`**, dan `mountToolbar`/`mountViewTools` mengenali baris itu lalu hanya
menyambungkan perilakunya. Karena itu tidak ada jeda saat tiga puluh lima ikon baru muncul
belakangan.
:::

---

## Berikutnya

- [{{ t('menu_intro_usage') }}](./usage) — jalan lewat npm, perakitan, masuk, dan keluarnya secara lengkap
- [{{ t('menu_intro_cdn') }}](./cdn) — cukup satu `<script>`, tanpa alat build

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
