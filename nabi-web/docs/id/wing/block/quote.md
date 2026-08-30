---
title: Kutipan
description: Kelompokkan teks kutipan atau pisahkan konteks di beberapa paragraf.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Kutipan

Kelompokkan teks kutipan atau pisahkan konteks di beberapa paragraf. Ketik `>` lalu Spasi pada paragraf kosong, atau ubah paragraf yang dipilih menjadi kutipan dari bilah alat.

Kutipan dapat memuat paragraf biasa maupun blok seperti daftar dan gambar. Mengubah rentang yang sama sekali lagi akan membukanya kembali menjadi paragraf di luar kutipan.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## Gaya CSS

Gaya kutipan dapat diubah melalui `.nabi-content blockquote`, misalnya batas dan jaraknya.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

Pertahankan struktur paragraf di dalam `blockquote`; ubah hanya tampilannya, seperti jarak luar, batas, dan warna.
