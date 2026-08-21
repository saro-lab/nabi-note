---
title: Pengantar
description: NABI NOTE adalah editor WYSIWYG open source yang berjalan di browser.
---

# Apa itu NABI NOTE?

NABI NOTE adalah **editor WYSIWYG open source** yang berjalan di browser.


## NABI TREE

Kalau ditangani langsung lewat HTML, ada masalah yang tidak bisa diselesaikan di sisi
server yang tanpa DOM. Karena itu dokumen ditangani sebagai objek JavaScript bernama
**NABI TREE**, yang diserialisasi dua arah ke JSON dan HTML. Saat perpindahan antara
NABI TREE dan HTML pun, unsur-unsur XSS ikut disingkirkan.

> Semua wing yang didukung nabi-note aman dari XSS, tetapi untuk `wing kustom (plugin
> eksternal)` Anda perlu memastikan sendiri dukungan XSS-nya dari pengembang wing itu.

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## Dukungan SSR (server-side) tanpa DOM

Dokumen NABI TREE yang tersimpan bisa **dibaca langsung di server (Node.js)** untuk
merakit HTML yang akan dikirim. Yang butuh DOM hanya **input** (`setHtml()`) dan
`mount*` yang menempel ke layar.

Untuk tempat yang cuma menampilkan, tidak perlu menyalakan editor sama sekali — cukup
satu pintu. Yang diterima hanya dokumen tersimpan dan `registry` (daftar wing yang
terdaftar), dan jawabannya berupa string HTML.

**Di server, sambungkan lewat `nabi-note/ssr`** — entry point ini hanya membawa yang
dibutuhkan untuk menggambar, sehingga permukaan edit dan alat layar sama sekali tidak
ikut termuat.

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// Daftar wing dirakit sekali saja saat server dinyalakan — dipakai bersama untuk berapa pun dokumen tersimpan.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['Satu baris komentar'] }]   // NABI TREE dari database
renderStoredHtml(saved, registry)
// '<p>Satu baris komentar</p>'
```

**Kalau bukan NABI TREE, hasilnya `null`.** Aturan penolakannya sama seperti
`setJson()`. Nilai yang lolos **tidak berbeda satu karakter pun** dari `getHtml()`
yang dikeluarkan editor — keduanya melewati langkah yang sama (normalisasi lalu
perakitan), jadi penyaringan XSS-nya pun sama persis.

Untuk menggambar editor lebih dulu di server, pakai pintu pasangannya — yang
ditambahkan hanyalah `data-key`.

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">Satu baris komentar</p>'
```

Dokumen tersimpan yang sama selalu mendapat `data-key` yang sama, sehingga HTML ini
bisa dikirim apa adanya dan disambungkan di browser dengan
`mountSurface({ nabi, registry, root, hydrate: true })` tanpa menggambar ulang
layar. **Halaman depan situs ini adalah contohnya sendiri** — dokumen di layar
pertama digambar oleh server, dan editor bangun di atasnya.

### Tiga entry point

| Yang disambungkan | Apa isinya | Kapan dipakai |
|---|---|---|
| `nabi-note` | Editor lengkap — perakitan, permukaan, alat layar | Tempat **menulis** |
| `nabi-note/ssr` | Hanya yang menggambar dokumen tersimpan ke HTML | Server, atau halaman yang cuma membaca |
| `nabi-note/viewer` | Perilaku sisi baca (sortir tabel, pewarnaan kode) | Tempat **menampilkan** HTML yang sudah diterbitkan |

`nabi-note/ssr` **sama sekali tidak menyentuh** permukaan edit (`surface`) dan alat
layar (`ui`) — pengujian yang menjaganya lewat sumber. Karena itu tidak ada jalan bagi
kode DOM untuk ikut masuk ke bundel server.

## Semua format adalah wing

Unit yang di editor lain biasa disebut "plugin" di sini disebut **wing**. Yang
dilihat langsung oleh core hanyalah paragraf (`p`), baris (`br`), dan teks polos —
judul, daftar, tabel, tebal semuanya adalah wing.

```ts
import { createNabiWith, parseNodes, boldWing } from 'nabi-note'

const bare = createNabiWith([], { parseHtml: parseNodes }).nabi
bare.setHtml('<p><b>tebal</b> <i>miring</i></p>')
bare.getHtml()
// '<p>tebal miring</p>'                    — tidak ada wing yang dideklarasikan, jadi berubah jadi teks polos.

const bold = createNabiWith([boldWing], { parseHtml: parseNodes }).nabi
bold.setHtml('<p><b>tebal</b> <i>miring</i></p>')
bold.getHtml()
// '<p><b>tebal</b> miring</p>'              — hanya boldWing yang dideklarasikan, jadi hanya itu yang tersisa, sisanya jadi teks polos.
```

Markup yang tidak didaftarkan sebagai wing **diubah menjadi teks polos.** Karena itu
HTML yang tidak dideklarasikan otomatis tersingkir, dan semua wing yang secara resmi
didukung nabi menyingkirkan skrip berbahaya.


## Antarmuka

Dokumen hanya bisa diubah lewat `applyCommand()`.

```ts
nabi.applyCommand('toggleMark', { w: 'b' })     // Bold
nabi.applyCommand('setHeading', { value: 2 })   // H2
nabi.undo()
nabi.redo()
```
Command **menjawab keberhasilannya sebagai `boolean`.** Kalau tidak ada yang berubah,
jawabannya `false` dan tidak meninggalkan riwayat atau mengubah apa pun.


## Lapisan kode

**Ini bukan urutan aliran nilai.** Ini adalah **arah dependensi** yang disusun dari
bawah ke atas, dan aturannya satu — **lapisan bawah tidak tahu lapisan atas.** Karena
itu lapisan bawah (`schema`·`doc`·`html`) tidak menyentuh DOM, dan itulah sebabnya ia
bisa berjalan langsung di server. Jalur nilai masuk-keluar ada di diagram NABI TREE
di atas.

<LayerStack
  :layers="layers"
  caption=""
/>

Arah ini bukan janji yang ditulis di dokumen, melainkan **dijaga oleh pengujian
otomatis** — begitu ada import yang melawan arah lapisan, pengujian langsung gagal
di situ.


## Istilah

| Kata | Arti |
|---|---|
| **mark** | Format huruf, contoh `<b>` · `<i>` · `<a>` |
| **blok (block)** | Contoh: paragraf · judul · daftar · tabel · gambar |
| **atribut paragraf (paragraph attribute)** | Atribut milik paragraf, contoh: perataan · drop cap |
| **paragraf pembungkus** | Paragraf yang membungkus objek satu-paragraf seperti tabel · daftar · gambar. |
| **claim** | Penentuan markup tertentu milik wing yang mana. |
| **parts** | Fungsi di dalam sebuah wing, contoh: baris/kolom tabel, baris ringkasan pada lipatan |

### Layar edit

| Kata | Arti |
|---|---|
| **caret** | Kursor pilihan di dalam editor |
| **baris konteks (context row)** | Toolbar yang mengatur status yang sedang dipilih caret, contoh: command baris/kolom tabel, kolom bahasa kode, kolom alamat/nama tautan, H1–H6 pada judul |

### Core

| Kata | Arti |
|---|---|
| **cocoon** | Tahap normalisasi NABI TREE. **Berjalan lagi setelah setiap command**, sehingga tidak ada command yang bisa meninggalkan dokumen yang melanggar aturan |
| **attach** | Hook yang dideklarasikan wing saat perlu menyentuh layar, contoh: drag kolom tabel, pewarnaan kode, toggle centang — semuanya ini. `mountSurface` memasang punya semua wing yang terdaftar sekaligus |
| **transformasi otomatis (input rule)** | Transformasi yang terjadi hanya dari mengetik huruf, contoh: tanda hubung dan spasi menjadi daftar, `#` dan spasi menjadi judul |


## Dokumen berikutnya

- [{{ t('menu_intro_usage') }}](./intro/usage) — perakitan, input, output secara lengkap
- [{{ t('menu_intro_cdn') }}](./intro/cdn) — cukup satu `<script>`, tanpa alat build
- [{{ t('menu_wing_custom') }}](./wing/custom) — membuat sendiri format yang belum ada

<script setup lang="ts">
import FlowHub from '../.vitepress/ui/FlowHub.vue'
import LayerStack from '../.vitepress/ui/LayerStack.vue'
import { useTranslate } from '../.vitepress/src/langs.ts'

const { t } = useTranslate()

const hubSources = [
  { label: 'HTML · JSON', note: 'input langsung · tempel · muat', kind: 'in' },
  { label: 'setHtml() · setJson()', note: 'input via fungsi', kind: 'gate' },
];

const hubCore = { label: 'NABI TREE', note: 'Tree Object', kind: 'core' }

const hubTargets = [
  { label: 'getHtml()', note: 'Output HTML', kind: 'out' },
  { label: 'getJson()', note: 'Output JSON', kind: 'out' },
  { label: 'getEditorHtml()', note: 'HTML untuk editor', kind: 'out' },
];

const layers = [
  { name: 'locale', what: 'Bahasa' },
  { name: 'code', what: 'Tokenizer murni yang dipakai bersama oleh layar edit dan sisi baca' },
  { name: 'schema', what: 'Bentuk NABI TREE dan definisi Cocoon' },
  { name: 'doc', what: 'Sisip · hapus · pisah · rentang. Tanpa DOM' },
  { name: 'caret', what: 'Posisi, seleksi, dan batas kursor' },
  { name: 'html', what: 'NABI TREE ↔ HTML' },
  { name: 'editor', what: 'Instance dengan antarmuka command' },
  { name: 'wing', what: 'Pemeriksaan Wings saat pendaftaran' },
  { name: 'wings', what: 'Wing resmi (bold, italic … table, upload…)' },
  { name: 'surface', what: 'Menyelaraskan caret · IME · input ke tree' },
  { name: 'ui', what: 'Lapisan UI' },
  { name: 'viewer', what: 'Hanya-baca' },
]
</script>
