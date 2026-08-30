---
title: Penyiapan SSR
description: Render dokumen NABI TREE tersimpan ke HTML dengan aman di server dan hidrasi editor di browser.
---

# Penyiapan SSR

Di server, impor hanya `nabi-note/ssr`, bukan surface atau UI browser. Modul ini memvalidasi JSON NABI TREE tersimpan dan mengubahnya menjadi HTML terbit atau HTML editor yang dapat dihidrasi.

## Render HTML terbit

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('The stored document could not be read.')
```

`renderStoredHtml()` memvalidasi dan menormalkan masukan JSON, lalu mengembalikan HTML terbit. `null` berarti registry saat ini tidak dapat membaca masukan itu. Sertakan CSS paket dan `.nabi-content` pada halaman terbit.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

Tambahkan `attachViewer()` dari `nabi-note/viewer` di browser hanya untuk pengurutan tabel interaktif atau penyorotan kode. Konten terbit biasa hanya membutuhkan CSS.

## Hidrasi markup editor yang sudah dirender

Untuk menampilkan editor sejak pengecatan pertama, render dengan `renderStoredEditorHtml()` di server dan teruskan `hydrate: true` ke surface browser.

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

Server dan browser harus memakai dokumen yang sama, deklarasi wing dalam urutan sama, serta opsi yang memengaruhi HTML. Sisipkan keluaran server tanpa perubahan sebagai anak langsung root konten, dan jangan menetapkan `contenteditable` lebih dulu pada root itu. Jika strukturnya berbeda, surface merender HTML editor baru.

## Render awal bilah alat juga

`renderToolbarHtml()` dan `renderViewToolsHtml()` dapat merender awal kontrol bilah alat di server. Mounting di browser memasang kontrol itu ketika registry, locale, dan urutan grup cocok. DOM host sembarang di dalam root bilah alat tidak didukung.

Jangan memakai API browser seperti `injectSheets()` selama SSR. Tautkan berkas `nabi-note/nabi.css` yang dibangun atau sertakan dalam bundel CSS Anda.
