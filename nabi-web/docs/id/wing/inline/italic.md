---
title: Miring
description: Miringkan teks terpilih.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Miring

Menampilkan teks terpilih dengan huruf miring. Ini berguna untuk membedakan judul karya atau kata asing secara halus dari teks utama. Klik lagi pada rentang yang sudah miring untuk menghapus formatnya.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
