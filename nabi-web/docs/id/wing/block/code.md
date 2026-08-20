---
title: Kode
---

# Kode

## Penjelasan

`codeWing` (id `code`) adalah **konstanta** yang memiliki blok kode (`<pre>`) —
bukan dipanggil dengan tanda kurung.

Ia wadah dengan `holds: 'inline'`, dan isinya ditekan menjadi teks biasa oleh
`repair` — tidak ada tanda atau wing lain yang bisa menyela. Bukan berarti ada
kolom khusus untuk itu di kontrak — wing inilah yang merapikan isinya sendiri.

Mengetik ` ``` ` pada baris kosong lalu menekan spasi atau Enter menjadikannya blok
kode — jika Anda menuliskan bahasanya sekalian, seperti ` ```ts `, bahasa itu ikut
tertangkap. `Tab`/`Shift+Tab` menambah dan mengurangi indentasi baris (jika beberapa
baris terpilih, sekaligus). Enter mewarisi indentasi baris sebelumnya.

Baris konteks baru muncul ketika karet berada di dalam kode — berisi kolom isian
untuk mengetik bahasanya langsung, "Tanpa bahasa", dan kolom-kolom untuk bahasa yang
sering dipakai.

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

Daftar ini hanyalah **jalan pintas** — bukan daftar bahasa yang dikenal inti. Bahasa
yang tidak ada di sini cukup Anda ketikkan sendiri di kolom pertama, dan nilainya
diteruskan apa adanya ke penyorotnya.

## Pewarnaan dipasang pada wing

`highlight` adalah **kait yang mengembalikan jenis, bukan warna** — bentuknya
`(sumber, bahasa) => {text, type?}[]`, dan `type`-nya terkunci pada salah satu dari
empat belas: `keyword`·`string`·`number`·`comment`·`function`·`class`·`variable`·
`operator`·`punctuation`·`tag`·`attribute`·`literal`·`regexp`·`meta`
(`CODE_TOKEN_TYPES`).

Warnanya ditentukan langsung oleh lembar gaya inti lewat selektor
`[data-nabi-token="…"]` — **hanya lima yang punya warna** (`comment`·`string`·
`keyword`·`number`·`literal`). Jenis lainnya cuma diberi penanda tanpa aturan
warna, sehingga tampil dengan warna teks biasa. Karena nilainya warna tetap, bukan
variabel CSS, untuk memakai warna lain atau varian gelap Anda harus menimpa
selektor itu sendiri.

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

Kamus tata bahasanya sendiri tidak ada di dalam paket — Anda harus memasangkannya
sendiri dengan sesuatu seperti Prism, highlight.js, atau Shiki.

Sisi yang mewarnai **dipasang pada wing** — tidak ada yang perlu di-mount terpisah.
Bangun `attach` dengan `makeCodeAttach` lalu tukar ke wing kode, dan `mountSurface`
akan memasangnya. Demo di situs ini memasangkan Shiki dengan cara itu
(`.vitepress/src/highlight.ts`).

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

// Wing adalah konstanta — yang ditukar hanya bagian yang terpasang (`attach`)
const wing = { ...codeWing, attach: makeCodeAttach({ highlight }) }
```

Berikan `version` sekalian agar diwarnai ulang **ketika dokumennya tetap sama
tetapi sisi yang mewarnai berubah**. Kasus itu terjadi pada penyorot yang mengambil
tata bahasanya secara asinkron (Shiki begitu ketika pertama kali bertemu sebuah
bahasa) — saat tata bahasanya tiba, dokumennya tidak berubah sehingga `onChange`
tidak berbunyi, dan tanpa ini Anda harus mengetik satu huruf sembarang dulu agar
warnanya masuk.

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight, version: () => grammarAge }),
}
// ketika tata bahasanya tiba terlambat — naikkan angkanya untuk mewarnai ulang
grammarAge += 1
```

Nilai tersimpannya mengikuti konvensi di luar — `<pre data-nabi-lang="ts"><code
class="language-ts">`, dan warnanya keluar sebagai atribut `data-nabi-token` (bukan
sebagai `style` inline).

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar wing sekaligus membangun pengetahuan skema, perintah, dan perakit — itulah `registry`
const { nabi, registry } = createNabiWith([codeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/code" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
