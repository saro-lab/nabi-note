---
title: टेक्स्ट रंग
description: चयनित पाठ पर अनुमति प्राप्त रंग नाम लागू करें।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# टेक्स्ट रंग

चयनित पाठ पर अनुमति प्राप्त रंग नाम लागू करें। Nilai tersimpan bukan string warna CSS; nilainya adalah nama yang diizinkan, dan warna sebenarnya ditentukan oleh variabel CSS `--nabi-tc-<name>`. Dengan begitu dokumen yang sama tetap terbaca di tema terang maupun gelap.

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

Jika `values` dihilangkan, palet default adalah `green`, `coral`, `violet`, `amber`, dan `blue`. Jika daftar dikurangi, warna lain ditolak oleh perintah dan saat memuat dokumen.

## CSS स्टाइल

Dokumen hanya menyimpan nama warna. Atur warna sebenarnya untuk editor dan tampilan terbit dengan variabel CSS.

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

Periksa kontras bersama warna latar. Dalam tema gelap, nama warna yang sama dapat menerima nilai berbeda.

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
