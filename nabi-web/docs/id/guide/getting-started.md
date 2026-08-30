---
title: Penggunaan dasar
description: Rangkai editor NABI NOTE berbasis browser, lalu simpan dan pulihkan dokumennya.
---

# Penggunaan dasar

Panduan ini membahas editor client-side rendered (CSR) di browser: pilih wing, mount editor dan UI-nya, lalu simpan dan pulihkan NABI TREE JSON.

## Instal dan tambahkan markup dasar

```bash
npm install nabi-note
```

Muat stylesheet yang sama untuk editor dan konten terbitan. Jangan tambahkan `contenteditable` sendiri; `mountSurface()` yang mengelolanya.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## Mount editor

`allBasic()` memilih wing resmi yang dapat digunakan tanpa integrasi khusus aplikasi. Tambahkan wing yang terhubung ke layanan, seperti upload, penyimpanan file, atau perbandingan dokumen, sesuai penjelasan di panduan masing-masing.

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'en',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'en',
  placeholder: 'Write something.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'en',
})
```

`locale` mengatur bahasa toolbar dan teks bantuan; berikan nilai yang sama ke setiap UI yang di-mount. `placeholder` hanya ditampilkan pada editor kosong. `onError` menerima kegagalan terisolasi dari perintah dan callback. `undoLimit` adalah jumlah entri undo (bawaan 200). `typingMergeMs` adalah jeda yang menggabungkan pengetikan berurutan menjadi satu langkah undo; atur ke `0` agar setiap penyisipan tetap terpisah.

Setiap editor memerlukan root konten dan toolbar sendiri yang tidak saling tumpang tindih. Pada halaman dengan beberapa editor, berikan setiap toolbar surface editornya sendiri melalui `surface` agar fokus dan pintasan tidak saling bercampur.

## Memilih wing

Gunakan `use()` dan `drop()` untuk menyisakan fitur yang Anda perlukan saja. Setiap halaman wing mendokumentasikan opsi yang diterimanya.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

Untuk bundle yang lebih kecil, berikan hanya wing yang diperlukan, seperti `boldWing` dan `imageWing`, sebagai array. Nama yang tidak dikenal, opsi yang tidak valid, dan dependensi yang hilang langsung gagal saat editor dibuat.

## Menyimpan dan memuat

Simpan keluaran `getJson()` sebagai NABI TREE JSON jika dokumen akan diedit kembali. `getHtml()` digunakan untuk keluaran terbitan. Jangan pernah menyimpan hasil khusus editor dari `getEditorHtml()`.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('The saved document could not be read.')

const publishedHtml = nabi.getHtml()
```

Gunakan `setHtml()` untuk mengimpor HTML eksternal. Editor browser sudah menyediakan parser HTML-nya, sehingga tidak diperlukan opsi parser. `setJson()` dan `setHtml()` mengembalikan `false` untuk input tidak kosong yang tidak valid dan membiarkan dokumen saat ini tetap utuh.

```ts
nabi.setHtml('<p>Imported document</p>')
```

JSON dan HTML sama-sama merupakan input yang tidak tepercaya. NABI NOTE membacanya melalui wing yang terdaftar dan aturan yang diizinkan, tetapi hal itu tidak menggantikan otorisasi upload atau kebijakan keamanan layanan Anda.

## API umum

| Tugas | API |
| --- | --- |
| Membuat editor | `createNabiWith`, `wings` |
| Mount surface dan toolbar | `mountSurface`, `mountToolbar` |
| Menyimpan dan memulihkan | `getJson`, `setJson`, `getHtml`, `setHtml` |
| Mengamati perubahan | `nabi.onChange(listener)` |
| Undo dan redo | `nabi.undo()`, `nabi.redo()` |
| Merender HTML di server | `renderStoredHtml` dari `nabi-note/ssr` |
| Menambahkan perilaku halaman terbitan | `attachViewer` dari `nabi-note/viewer` |
| Membandingkan dokumen | `diffDocs` dari `nabi-note/diff` |

Untuk tipe yang tepat dan semua argumen, periksa dahulu deklarasi paket yang terinstal. Alat otomatisasi juga dapat menggunakan [referensi API berbahasa Inggris](https://nabi.saro.me/llms/api-reference.md).

## Melepas mount

Unmount dalam urutan kebalikan dari pembuatan. Jangan mengubah `innerHTML` root pengeditan secara langsung; ubah dokumen melalui API publik seperti `setJson()`, `setHtml()`, atau `applyCommand()`.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
