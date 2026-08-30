---
title: Daftar berpoin
description: Mencantumkan beberapa item tanpa urutan.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Daftar berpoin

Ini adalah daftar yang mencantumkan beberapa item tanpa urutan. Pada paragraf kosong, ketik `-` lalu tekan Spasi, atau ubah melalui toolbar. Paragraf yang dipilih juga dapat sekaligus dijadikan daftar.

Di dalam daftar, tekan Tab untuk menjorokkan satu tingkat dan Shift+Tab untuk mengurangi inden. Enter membuat item berikutnya; tekan Enter sekali lagi pada item kosong untuk mengakhiri daftar.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
