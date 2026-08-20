---
title: Blok lipat
---

# Blok lipat

## Penjelasan

`detailsWing` (nama `details`, pintasan `D`) memiliki kotak lipatan (`<details>` +
`<summary>`). Baris ringkasan dibawa bersama lewat `parts`, jadi tidak didaftarkan
terpisah — bukan array, melainkan rekaman (record).

```ts
parts: { summary: { holds: 'inline' } }
```

Menekan tombolnya membungkus blok-blok yang tercakup karet menjadi kotak lipatan
baru, dengan baris ringkasan kosong berdiri paling depan. Menekan Enter di baris
ringkasan turun ke isinya (baris ringkasan itu sendiri tidak terbelah).

**Editor menggambarnya persis seperti yang akan tersimpan.** Kotak yang tersimpan
dalam keadaan terlipat pun tergambar terlipat di editor, dan menekan segitiganya
membuka/menutup di tempat — penekanan itulah yang mengubah nilai tersimpan (`o`).
Jika karet berada di dalamnya saat dilipat, karet keluar dari kotak itu.

::: tip Tidak ada kolom di baris konteks
Dulu ada dua tombol — **simpan terbuka** dan **simpan terlipat**. Itu perlu karena
dulu layar selalu digambar terbuka, sehingga hanya lewat tombol itu Anda bisa
menyatakan keadaan mana yang akan tersimpan. Sekarang layar menggambar persis nilai
tersimpan dan segitiga yang mengubahnya, jadi tombol itu menjadi tempat mengatakan hal
yang sama dua kali dan sudah disingkirkan.
:::

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, detailsWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar sayap membangun pengetahuan jenis, perintah, dan perakit sekaligus — itulah `registry`
const { nabi, registry } = createNabiWith([detailsWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/details" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
