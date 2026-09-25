---
title: "Tema ikon"
description: "Gunakan variabel CSS untuk mengganti ikon wing, pratinjau, layar penuh, panel, perbandingan, dan pengurutan tabel. SVG, WebP, dan PNG dapat dicampur; ikon yang tidak ditentukan memakai berkas bawaan."
---

# Tema ikon

Gunakan variabel CSS untuk mengganti ikon wing, pratinjau, layar penuh, panel, perbandingan, dan pengurutan tabel. SVG, WebP, dan PNG dapat dicampur; ikon yang tidak ditentukan memakai berkas bawaan.

## Menentukan berkas

Muat CSS dan tambahkan kelas tema pada editor atau induk bersama. Gambar mempertahankan warna, transparansi, dan rasio aslinya.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

Gunakan jalur dari akar seperti `/icons/...` atau URL HTTPS lengkap. Jalur relatif belum tentu dihitung dari lokasi berkas tema. Jika menghosting CSS sendiri, salin versi yang sama dari `dist/icons/` di samping `nabi.css`. Jika gambar gagal dimuat, ikon kosong, tetapi nama tombol, tooltip, dan tindakannya tetap tersedia.

## Mencari ikon lain

Tambahkan `--nabi-icon-` di depan nilai `data-nabi-icon` elemen untuk memperoleh variabel CSS. Misalnya, `diff-close` memakai `--nabi-icon-diff-close`. Lihat <a href="/llms/icons.md" target="_blank" rel="noopener">kontrak ikon</a> untuk aturan kunci konteks, menu, penyimpanan, riwayat, dan lainnya, termasuk pengodean karakter khusus.

## Mode gelap dan panel

Mengubah kelas tema atau variabel CSS memperbarui ikon tanpa mount ulang. Ikon bawaan mengikuti tema terang/gelap. Berkas khusus tidak mewarisi `currentColor`; tetapkan varian gelap seperti contoh bila diperlukan. Panel di bawah `body` juga mengikuti tema ikon dan perubahan kelas/gaya editor asal. Letakkan variabel pada editor atau induk bersama, bukan hanya di dalam toolbar.

## Menampilkan tombol bawaan

`showPreview` dan `showFullscreen` sama-sama bernilai `true` secara bawaan. `false` menghapus tombol terkait, target fokus, dan event-nya. Jika keduanya `false`, area alat kosong juga tidak dibuat.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

Berikan opsi tampilan yang sama ke SSR dan mount. Untuk mengubah konfigurasi, panggil `tools.unmount()` lalu mount dengan opsi baru. Jika kedua tombol tidak dibutuhkan, mount alat dan markup SSR tetap dapat dihilangkan sepenuhnya. Panggilan langsung `openPreview()` dan `setFullscreen()` tetap tersedia.
