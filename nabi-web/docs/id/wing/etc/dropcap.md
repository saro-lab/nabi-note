---
title: Drop cap
description: Mulai teks isi dengan huruf pertama berukuran besar.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Drop cap

Tempatkan huruf pertama paragraf pada ukuran lebih besar dan biarkan baris berikutnya mengalir di sisinya. Ini adalah pemformatan tingkat paragraf, sehingga tidak diterapkan hanya pada sebagian kata terpilih.

Tampilan terbit dan tampilan edit mempertahankan bentuk yang sama. Saat mengedit, huruf pertama dibungkus dalam elemen nyata agar posisi kursor dan hapus tidak bergeser; elemen itu tidak termasuk dalam isi dokumen tersimpan.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## Gaya CSS

Tampilan terbit dan tampilan edit memakai pemilih berbeda untuk huruf pertama. Tampilan terbit memakai `[data-nabi-dropcap="1"]::first-letter`, sedangkan tampilan edit memakai elemen nyata `[data-nabi-dropcap-letter]`. Ketika mengubah nilai tampak seperti warna, font, atau ukuran, tulis kedua pemilih bersama-sama agar hasil edit dan terbit terlihat sama.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

Jika mengubah ukuran dan tinggi baris, terapkan nilai yang sama pada kedua pemilih.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

Drop cap menghitung aliran baris di sekitar huruf pertama, sehingga mengubah hanya satu sisi atau membuat nilainya terlalu besar dapat merusak bentuk WYSIWYG. Tetap hindari menambahkan aturan `::first-letter` baru ke editor. Di editor, atur gaya hanya pada `[data-nabi-dropcap-letter]` yang sudah ada.
