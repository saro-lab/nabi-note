---
title: Lewat CDN
description: Cukup satu tag script, tanpa alat build — semuanya menggantung di NabiNote global.
---

# Lewat CDN

<CdnDemo />

---

## Apa yang baru saja terjadi

Anda tidak perlu membacanya untuk berkas di atas tetap berjalan. Baca kalau ingin
mengubahnya sendiri.

### Dua tag saja sudah cukup untuk memasangnya

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

**Semua** yang diekspor paket ini menggantung di satu global `NabiNote`.
**Sheet dipasang manual** — mount tidak menyuntikkan CSS, jadi kalau `<link>` ini
terlewat, editor akan tampil polos tanpa gaya.

### Rangka

```html
<div id="app" class="nabi">                    <!-- Akar tempat warna, sudut, dan font hidup -->
  <div id="chrome" class="nabi-toolbar">        <!-- Toolbar dan baris konteks menempel jadi satu blok -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- Pratinjau · layar penuh (di ujung kanan) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- Terisi sendiri sesuai apa yang ditunjuk caret -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

`id` boleh dipakai nama apa saja — yang dioper ke mount adalah **elemennya**, bukan
namanya. Empat class (`nabi`·`nabi-toolbar`·`nabi-toolbar-row`·`nabi-content`) adalah
pegangan yang dipakai sheet, jadi biarkan seperti itu. Kalau tidak memakai
pratinjau/layar penuh, cukup hapus `<span id="tools">` bersama baris
`mountViewTools`. Wadahnya boleh dioper ke mana saja — `mountViewTools` mendirikan
sendiri kotaknya yang muncul di ujung kanan, jadi biarpun toolbar dioper apa adanya,
baris tombolnya tidak berantakan.

### Memilih wing

Memilih wing hanyalah satu baris builder. Berkas di atas mengambil dua puluh sembilan
wing bawaan, menghapus upload, dan mempersempit typeface jadi dua pilihan.

```js
var wings = N.wings().all().drop('upload').use('tf', { values: ['sans', 'serif'] })
```

- `all()` memulai dari semua wing resmi. **Kalau tidak dipanggil, mulai dari tangan
  kosong** — hanya yang dipanggil lewat `use()` yang termuat.
- `use('nama', opsi?)` menambahkan satu. Kalau dipanggil pada wing yang sudah ada,
  hanya opsinya yang ditumpuk — seperti `use('tf', { values: [...] })` di atas. Kalau
  ada wing yang jadi tumpuannya (upload butuh salah satu dari gambar atau tautan
  untuk bisa hidup), itu ditarik ikut secara diam-diam.
- `drop('nama')` menghapus dari yang sudah ada. Kalau mencoba menghapus wing yang
  ditumpangi wing lain, langsung melempar galat dan memberi tahu apa yang harus ikut
  dihapus.
- Nama adalah kunci singkat yang ditulis di nilai tersimpan — seperti `b` (tebal)·
  `tf` (typeface)·`upload`. Daftar lengkapnya lihat lewat `console.log(N.wingNames())`.
- **Kalau salah panggil, langsung melempar di baris itu.** Salah ketik nama, kunci
  opsi yang tidak dikenal, nilai di luar daftar — semuanya begitu, dan pesan yang
  dilempar sudah membawa cara memperbaikinya — `use('bod')` menjawab "maksud Anda
  'b' (tebal)?". Tidak ada tempat yang diam-diam diabaikan.

`createNabiWith` menerima builder-nya langsung, jadi tidak perlu memanggil `build()`
— `build()` hanya perlu dipanggil di tempat yang memang butuh array. Kalau hanya
memilih beberapa saja, array tetap jawabannya.

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

Wing buatan sendiri dimasukkan sebagai objek — seperti
`N.wings().all().use(customWing)`. `w` milik wing itu harus diawali `ex`
(`exNote`) — supaya tidak bertumpuk dengan nama resmi yang akan datang di nilai
tersimpan, yang bisa membuat dokumen lama terbaca dengan arti berbeda. Cara membuatnya
ada di [{{ t('menu_wing_custom') }}](../wing/custom).

Setiap wing dibahas satu per satu di [{{ t('menu_wing') }}](../wing/inline/bold).

### Jalur bertanya dan memberi tahu

Berkas di atas memasang `alert`·`confirm` bawaan browser lewat `ask` — pertanyaan
seperti "Ada teks yang belum disimpan. Tetap buka?" masuk lewat kotak itu. Kalau
tidak dipasang, jawaban pertanyaan itu adalah "tidak", dan pesan singkat yang tidak
butuh jawaban ditampilkan wadah toast bawaan core di bawah toolbar — tidak perlu
memasang apa pun sendiri untuk notifikasi seperti galat upload. Lebih lanjut ada di
[{{ t('menu_intro_usage') }}](./usage).

### Mengeluarkan nilai

| | |
|---|---|
| `nabi.getHtml()` | HTML untuk disimpan/diterbitkan |
| `nabi.getJson()` | NABI TREE (JSON) |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | Memasukkan lagi |
| `nabi.onChange(fn)` | Setiap kali nilainya berubah |
| `N.renderStoredHtml(json, registry)` | Menggambar dokumen tersimpan jadi HTML tanpa editor (lihat [Sisi baca](#sisi-baca) di bawah) |

---

## Alamat

Untuk mengunci versi, tambahkan nomor versi di alamatnya. unpkg pun memberi berkas
yang sama.

**Jangan pakai alamat tanpa versi (`/npm/nabi-note`)** — jsDelivr menyimpan cache
alamat itu cukup lama, sehingga bundel dan sheet bisa tercampur dari versi yang
berbeda.

| | Alamat |
|---|---|
| **Bundel (terbaru)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **Bundel (terkunci)** | <code>{{ CDN_BUNDLE }}</code> |
| **Sheet (terbaru)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **Sheet (terkunci)** | <code>{{ CDN_SHEET }}</code> |
| **Bundel** (unpkg) | `https://unpkg.com/nabi-note` |

Bundel ini ikut terbawa dalam paket rilis npm, jadi **tidak ada distribusi CDN yang
terpisah.**

---

## Sisi baca

Halaman yang **hanya menampilkan** HTML tersimpan tidak perlu menyalakan editor.
Pasang sheet yang sama dan masukkan nilainya ke dalam `.nabi-content`, dan tampilannya
sama seperti yang terlihat di editor.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- Nilai yang tersimpan dari getHtml() -->
</div>
```

Kalau yang tersimpan bukan HTML melainkan **NABI TREE (JSON)**, itu bisa digambar
langsung tanpa menyalakan editor. Yang dibutuhkan hanyalah dokumen tersimpan dan
daftar wing yang terdaftar.

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['Satu baris komentar'] }]   // NABI TREE dari server
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

Kalau bukan NABI TREE, jawabannya `null`, dan nilai yang lolos tidak berbeda satu
karakter pun dari `getHtml()` yang dikeluarkan editor — penyaringan XSS-nya pun sama
persis. Pintu ini tidak memakai DOM, sehingga tetap berjalan di server (Node.js), dan
**jalan untuk membuat HTML lebih dulu di server** terbuka lewat pintu yang sama
(lihat [{{ t('menu_intro_ssr') }}](./ssr#tempat-yang-hanya-menggambar-dokumen-tersimpan-tanpa-menyalakan-editor)).

Server yang dipasang lewat npm memakai **`nabi-note/ssr`**, bukan bundel global —
entry point ini hanya membawa yang dibutuhkan untuk menggambar, sehingga permukaan
edit dan alat layar tidak ikut termuat.

Satu berkas sheet **membawa CSS semua wing** — karena berkasnya tidak tahu wing mana
yang terdaftar, semuanya dimuat.

Tampilannya sepenuhnya ditanggung sheet, tapi **sortir tabel dan pewarnaan kode
adalah pekerjaan JavaScript di sisi baca** — mengklik judul kolom untuk menyusun
ulang baris, dan memotong-motong teks kode untuk diberi warna, tidak bisa dilakukan
CSS. Kalau ingin, pasang runtime sisi-baca lewat satu pintu.

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'id' })
</script>
```

- Tanpa ini pun dokumen tetap tampil normal — hanya tabel dengan sortir tidak
  berfungsi dan kode berwarna satu warna saja.
- Sortir tabel hanya terpasang pada tabel yang sortirnya dinyalakan di editor
  (ditandai atribut `data-nabi-sortable`).
- Pewarnaan kode dijawab tokenizer bawaan, jadi tidak butuh dependensi. Untuk memakai
  highlighter seperti Shiki, pasang lewat hook seperti `{ locale: 'id', highlight }`
  — bobotnya jadi tanggungan halaman yang memasangnya.
- Bundel global `NabiNote` tidak punya pintu ini — agar halaman baca tidak ikut
  memuat seluruh editor, `nabi-note/viewer` berdiri terpisah. Host yang memasang
  lewat npm juga memasang pintu yang sama di pratinjau, seperti di
  [{{ t('menu_intro_usage') }}](./usage#memasang-runtime-sisi-baca-ke-pratinjau).

---

## Dokumen berikutnya

- [{{ t('menu_intro_usage') }}](./usage) — Jalan lewat npm, perakitan, input, dan output secara lengkap
- [{{ t('menu_wing_custom') }}](../wing/custom) — Membuat sendiri format yang belum ada

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// Nomor versi tidak ditulis manual — dibaca langsung dari package.json milik nabi-npm
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
