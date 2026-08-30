---
title: Perataan
description: Ubah perataan horizontal untuk paragraf dan blok objek.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Perataan

Ratakan paragraf saat ini, atau paragraf dalam rentang pilihan, ke kiri, tengah, atau kanan. Objek di dalam paragraf, seperti gambar, video, dan tabel, diratakan melalui paragraf pembungkusnya.

Perataan disimpan sebagai atribut paragraf, bukan pemformatan teks. Blok kode dikecualikan dari perataan karena inden di sana memiliki makna.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```
