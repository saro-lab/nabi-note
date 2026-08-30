---
title: Detail
description: Kelompokkan ringkasan dan isi, serta simpan apakah blok dimulai terbuka.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Detail

Kelompokkan ringkasan singkat dan isi dalam satu blok. Saat membuatnya dari bilah alat, masukkan ringkasannya lebih dahulu lalu lanjutkan menulis isi di bawahnya.

Keadaan terbuka yang diatur dengan segitiga disimpan dalam dokumen dan menjadi keadaan awal pada tampilan terbit. Ketika mengedit, isi tetap terbuka agar dapat diubah, tetapi nilai keadaan yang tersimpan dipertahankan.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## Gaya CSS

Atur gaya blok detail dengan `.nabi-content details`, dan judulnya dengan `.nabi-content details > summary`.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

Atribut `open` adalah keadaan terbuka awal yang disimpan penulis. CSS dapat menata keadaan ini, tetapi sebaiknya jangan memaksakan keadaannya.
