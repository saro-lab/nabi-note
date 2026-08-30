---
title: ہائی لائٹ
description: منتخب متن کے پیچھے اجازت شدہ highlight رنگ لگائیں۔
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ہائی لائٹ

منتخب متن کے پیچھے اجازت شدہ highlight رنگ لگائیں۔ Data tersimpan hanya menyimpan nama warna yang diizinkan, bukan nilai warna CSS bebas, sehingga data dokumen dan gaya visual tetap terpisah.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

Jika `values` dihilangkan, palet default adalah `yellow`, `green`, `cyan`, `pink`, `purple`, dan `orange`. Jika daftar dipersempit, warna yang tidak terdaftar tidak dipertahankan bahkan saat dokumen lama dimuat.

## CSS اسٹائل

Dokumen hanya menyimpan nama warna. Ubah warna editor dan tampilan terbit melalui variabel CSS.

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

Mengubah beberapa warna bersama memungkinkan nama warna dokumen tetap sama sementara hanya nuansa produk yang disesuaikan.

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
