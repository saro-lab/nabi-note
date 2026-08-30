---
title: Daftar tugas
description: Daftar yang menyimpan status selesai bersama dokumen.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Daftar tugas

Ini adalah daftar dengan status selesai. Pada paragraf kosong, ketik `[ ]` atau `[x]` lalu tekan Spasi, atau buat melalui toolbar; klik kotak centang untuk mengubah statusnya.

Status tercentang disimpan bersama dokumen sebagai atribut item. Saat item dibagi, status tercentang mengikuti item yang masih berisi teks, bukan item kosong sebelumnya, sehingga membagi tugas yang sudah selesai tidak membalik statusnya.

<WingDemo path="/wing/block/task-list" />

```ts
const selected = wings().use('tl').build()
```
