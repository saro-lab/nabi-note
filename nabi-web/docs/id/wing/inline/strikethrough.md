---
title: Coret
description: Coret teks terpilih.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Coret

Menarik garis melalui bagian tengah teks terpilih. Gunakan untuk tetap menampilkan ungkapan yang diubah atau informasi yang sudah tidak berlaku tanpa menghapusnya. Menerapkannya lagi pada rentang yang sama menghapus formatnya.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
