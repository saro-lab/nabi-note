---
title: Tabel
description: Buat baris dan kolom, edit sel, dan dukung pengurutan kolom.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tabel

Pilih baris dan kolom dari bilah alat untuk membuat tabel. Di dalam sel, isi berlanjut dengan pemisah baris alih-alih beberapa paragraf; Tab dan Shift+Tab berpindah ke sel berikutnya atau sebelumnya.

Menambah dan menghapus baris atau kolom, menggabungkan sel, dan mengubah sel kepala dilakukan di sekitar sel yang dipilih. Untuk memakai pengurutan kolom di tampilan terbit setelah tabel disimpan sebagai dapat diurutkan, hubungkan `attachViewer()` dari `nabi-note/viewer`. Tabel dengan sel gabungan tidak diurutkan.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## Gaya CSS

Atur gaya tabel dengan `.nabi-content table`, dan sel dengan `.nabi-content :is(th, td)`. Jangan mengubah struktur sel atau tombol urut yang disisipkan viewer.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

Jika viewer terhubung, pertahankan tombol `.nabi-sort`. Jika Anda menimpa `position` sel atau padding kanan secara paksa, tombol urut dapat tertindih.
