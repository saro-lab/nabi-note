---
title: Wing kustom
description: Kontrak dan urutan implementasi untuk menambahkan fitur dokumen yang dapat disimpan.
---

# Wing kustom

Wing kustom bukan sekadar tombol toolbar. Wing ini adalah ekstensi deklaratif yang menyatukan struktur dokumen tersimpan, perintah, konversi HTML dan Markdown, aturan impor, serta perilaku tampilan. Registry memvalidasinya sebelum editor dibuat, sehingga struktur yang tidak valid tidak masuk ke dokumen.

## Mulailah dengan factory yang paling sempit

Sebagian besar pemformatan tidak memerlukan deklarasi lengkap. Gunakan `simpleMark()` untuk mark inline tanpa nilai, `valueMark()` untuk mark dengan kumpulan nilai terbatas, `boxObject()` untuk blok tanpa anak, dan `listFamily()` untuk daftar.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## Membuat beberapa jenis wing

Setiap contoh di bawah memiliki bentuk penyimpanan yang berbeda. Daftarkan satu terlebih dahulu dan periksa `getJson()` serta `getHtml()`. Tambahkan perintah dan tombol hanya setelah strukturnya berfungsi.

### 1. Mark inline tanpa nilai: penekanan

Gunakan `simpleMark()` ketika sebuah fitur hanya membungkus teks. Contoh ini menyimpan `exStrong` dan merendernya sebagai `<strong>`.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

Dengan `clearable: true`, hapus format juga menghapus mark ini. Sebelum menambahkan tombol, terapkan dengan `nabi.applyCommand()` atau perintah kustom lainnya. Selector `.nabi-content strong` yang sama memberi gaya pada editor dan konten terbitan.

### 2. Mark inline dengan nilai: nada status

Gunakan `valueMark()` untuk warna, ukuran, atau status yang dipilih dari kumpulan yang diizinkan. Nilai disimpan di `a.v`; nilai di luar daftar dihapus selama `repair()`.

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

Bentuk tersimpannya adalah `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }`. CSS menargetkan nilai tersimpan, sehingga konten terbitan juga berubah. Jangan sembarangan menghapus nilai dari daftar yang sudah ada: dokumen yang sebelumnya disimpan dapat kehilangan nilainya saat dibaca.

### 3. Blok tanpa anak: pemisah

Gunakan `boxObject()` untuk objek mandiri tanpa anak, seperti gambar, video, atau pemisah.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

Untuk objek dengan nilai seperti URL atau lebar, deklarasikan validasi di `attrs` dan masukkan nilai wajib ke `requires`. Tolak nilai yang tidak dapat diverifikasi dengan `null`, jangan diam-diam menggantinya dengan nilai bawaan.

### 4. Blok dengan beberapa paragraf: callout

Untuk blok yang menampung konten dokumen, deklarasikan `container`. `holds: 'blocks'` mengizinkan anak berupa paragraf, daftar, dan blok objek.

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

Deklarasi ini saja tidak membuat cara untuk membungkus paragraf yang dipilih. Tambahkan perintah murni pada `commands` dan `button` yang memanggilnya sebelum mengekspos fitur di UI editor.

### 5. Pasangan daftar dan item yang selalu berpasangan

Gunakan `listFamily()` ketika daftar dan item harus selalu hadir bersama.

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` memperbaiki blok di dalam daftar dengan membungkusnya dalam item. Tambahkan `itemDecl` dan `repairItem` untuk nilai tingkat item, seperti status dicentang.

### Daftarkan dalam satu pilihan yang berurutan

Gunakan deklarasi yang sama dalam urutan yang sama di server dan di browser.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

## Tentukan nama dan struktur dokumen

Nama yang masuk ke dokumen harus cocok dengan `ex[A-Z0-9]...`. Nama seperti `exCallout` mencegah wing resmi di masa depan mengubah makna konten tersimpan.

`place` menentukan bentuk penyimpanan: `mark` membungkus konten inline, `void` adalah blok tanpa anak, `container` menampung anak, `attr` mengubah atribut paragraf, dan `tool` tidak membuat node dokumen. Sebuah `container` memerlukan `holds: 'blocks' | 'inline'` serta `toHtml()`.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf`, dan `parts` mendeklarasikan batasan struktural. Deklarasi `parts` juga memerlukan `partHtml` untuk setiap bagian. Gunakan `attrKey` dan `attrValues` untuk membatasi wing pemilih nilai.

## Semua opsi deklarasi

Deklarasikan hanya yang diperlukan wing. Factory sudah menyediakan beberapa field untuk Anda.

| Area | Opsi | Tujuan |
| --- | --- | --- |
| Dasar | `w`, `place`, `basic`, `styles` | Nama, jenis struktur, keanggotaan katalog dasar, CSS bawaan |
| Struktur | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | Jenis anak, perilaku Enter, atribut yang diizinkan, atribut boolean |
| Struktur | `parts`, `allows`, `noAlign`, `requiresAnyOf` | Bagian internal, anak yang diizinkan, pengecualian perataan, dependensi wing |
| Nilai | `attrKey`, `attrValues`, `currentValue` | Kunci dan daftar nilai tersimpan, deteksi nilai saat ini |
| Perintah dan input | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | Perintah, penanganan tombol, perilaku Escape/tombol ganda, aturan autoformat |
| Perilaku surface | `attach` | Perilaku DOM dan pembersihan untuk surface |
| Konversi | `toHtml`, `partHtml`, `toMd`, `partMd` | Keluaran HTML dan Markdown |
| Impor dan perbaikan | `claim`, `ioFilter`, `repair`, `partRepair` | Impor HTML, penanganan file, validasi dan perbaikan JSON |
| UI | `button`, `buttons`, `context` | Deklarasi UI toolbar dan konteks |
| Hapus format | `clearable` | Apakah hapus format menghapusnya |

`w` dan `place` selalu diperlukan. Wing `mark`, `void`, dan `container` yang menghasilkan node juga memerlukan `toHtml()`. Container memerlukan `holds`; setiap bagian yang dideklarasikan memerlukan `partHtml` pasangannya.

## Jaga HTML, Markdown, dan JSON tetap bersama

`toHtml()` merender node tersimpan menjadi HTML, sedangkan `toMd()` mengekspor Markdown. Tanpa builder Markdown, HTML yang dihasilkan tetap dipertahankan agar informasi tidak hilang. Gunakan `claim()` untuk mengenali hanya elemen HTML dan atribut tervalidasi milik Anda saat mengimpor.

`repair()` berjalan ketika JSON dimuat dan kembali setelah perintah. Kembalikan node yang telah diperbaiki untuk atribut tidak valid, atau `null` untuk node yang tidak dapat dipertahankan. Bangun HTML dengan `ctx.element()`, `ctx.escape()`, dan `ctx.url()`; jangan pernah menggabungkan tag, atribut, atau URL melewati pemeriksaan tersebut.

## Pisahkan perintah dari perilaku tampilan

Perintah adalah fungsi murni dari dokumen dan seleksi yang mengembalikan dokumen berikutnya beserta seleksi di dalamnya. Perintah tidak pernah membaca atau mengubah DOM, dan mengembalikan `null` jika tidak dapat membuat perubahan yang valid. Namai perintah dengan lower camel case yang dimulai kata kerja, seperti `insertNote`.

Letakkan perilaku khusus DOM, seperti pemilihan drag pada tabel, di `attach(host)`. Segera daftarkan pembersihan setiap listener atau atribut yang berubah dengan `host.onDispose()` agar penyiapan yang gagal tetap dibersihkan. Jangan mengubah DOM teks yang sedang dikomposisi atau pemetaan seleksi surface.

Deklarasikan kontrol toolbar dan konteks dengan `button`, `buttons`, dan `context`; menggandakan aturan perintahnya di UI aplikasi dapat membuat UI dan model dokumen menyimpang.

## Gaya CSS

Masukkan CSS dasar yang diperlukan wing ke `styles`. Gaya wing bawaan sudah termasuk dalam `nabi-note/nabi.css`. Browser yang merangkai gaya registry terpilih dapat memakai `collectSheets()` dan `injectSheets()`; SSR sebaiknya menautkan file CSS.

Gunakan class dan atribut data yang sama untuk pengeditan dan konten terbitan, tetapi jangan mengubah struktur, `display`, atau `white-space` `[data-key]` pengeditan. CSS hanya boleh mengubah tampilan, bukan pemetaan caret.

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

Targetkan hanya class atau atribut data yang dibuat oleh `toHtml()`. Pertahankan perubahan khusus layanan tetap lebih sempit, misalnya `.article-body .ex-callout`.

## Verifikasi seluruh kontrak

Pastikan dokumen JSON yang disimpan dimuat ulang menjadi struktur dan HTML yang sama. Uji bahwa registry menolak nama tidak valid, perintah duplikat, builder yang hilang, dan dependensi yang tidak terpenuhi. Cakup impor HTML dan input `repair()` yang tidak valid, penanganan seleksi perintah, keluaran SSR, dan tampilan terbitan yang telah diberi gaya.

Untuk tipe dan argumen factory lengkap, periksa deklarasi terinstal dan [referensi API berbahasa Inggris](https://nabi.saro.me/llms/api-reference.md).
