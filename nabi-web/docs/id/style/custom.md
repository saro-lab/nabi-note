---
title: Gaya kustom
description: Warna dan bentuk diubah dengan menimpa variabel CSS.
---

# Gaya kustom

**Host yang memasang lembar gayanya** — satu baris `import 'nabi-note/nabi.css'` bila memakai
bundler, atau satu `<link>` bila lewat CDN. Setelah itu, tinggal menimpa variabel saja.

Aturan komponen tidak membawa **satu literal warna pun.** Semuanya digambar lewat variabel
`--nabi-*`, jadi timpa variabelnya dan sisanya ikut berubah.

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

Alasan kelasnya ditumpuk tiga kali ada di [Menghindari
spesifisitas](#menghindari-spesifisitas) di bawah.

::: tip Premis besar halaman ini — nilai tersimpan tidak berdiri sendiri
HTML keluar (`getHtml()`) **tidak mengandung satu karakter `style` inline pun.** Nilai
tersimpan hanya menyatakan *apa*-nya lewat atribut (`data-nabi-align="center"`), sedangkan
lembar gaya inilah yang menyatakan bagaimana rupanya. Jadi ketika sisi pembaca menggambar HTML
tersimpan, ia harus berada **di dalam `.nabi-content` yang memikul lembar gaya ini** agar
rupanya sama seperti di editor — lihat [Menggambar HTML tersimpan di tempat
lain](#menggambar-html-tersimpan-di-tempat-lain) di bawah.
:::

::: tip Gelap · terang sudah tersedia
**Tidak ada** token yang wajib ditimpa host demi tema. Lembar inti sudah membawa ketiganya —
nilai bawaan terang, penulisan ulang `.dark`, dan penulisan ulang eksplisit `.light`. Di dalam
editor, situs ini pun tidak menimpa apa pun selain empat token jenis huruf.
:::

## Token warna · bentuk

| Token | Arti | Bawaan (terang) |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | latar · permukaan sedikit tertekan | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | teks · teks pudar · teks di atas aksen | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | garis · warna aksen | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | bahaya · teks di atasnya | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | bayangan kotak · latar pratinjau | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | sudut | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | sudut lapisan (panel, pratinjau, lightbox) | `.25rem` |
| `--nabi-z-sticky` | nomor lapisan baris yang menempel | `20` |
| `--nabi-grid-cell` | ukuran sel kisi ukuran tabel | `1.125rem` |
| `--nabi-hl-yellow`·`green`·`cyan`·`pink`·`purple`·`orange` | enam warna stabilo | warna tembus pandang |
| `--nabi-tc-green`·`coral`·`violet`·`amber`·`blue` | lima warna teks | warna pekat |

Tabel ini hanya memuat yang **dideklarasikan langsung** oleh lembar inti (`nabi.css`). Tempat
deklarasinya bukan satu `.nabi` saja, melainkan tiga —
`:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))`. Overlay pratinjau adalah anak
`body`, sehingga pewarisan dari `.nabi` tidak sampai ke sana, dan `.nabi-content` yang berdiri
sendiri di luar editor pun harus menerima token itu langsung.

Daftar yang sama tertulis tiga kali (bawaan terang · `.dark` · `.light` eksplisit). **Sisi yang
menimpa tidak perlu melihat ketiganya** — kalahkan spesifisitasnya sekali saja, dan nilai yang
Anda tulis berlaku untuk ketiga kasus itu. Namun bila Anda ingin nilai berbeda di gelap, Anda
harus menambahkan sendiri kondisi `.dark`.

## Token yang hanya dirujuk, tak pernah dideklarasikan

Variabel di bawah ini hanya **dirujuk oleh inti, tidak dideklarasikan**. Jika host tidak
memberi nilai, fallback dalam kurung yang berlaku. Karena tidak ada tempat deklarasinya,
**menuliskannya pada `:root` pun langsung berlaku** — di sinilah bedanya dengan token warna ·
bentuk di atas (yang dideklarasikan pada `.nabi`, tempat pewarisan tidak bisa menang).

| Token | Arti | Fallback |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | jenis huruf yang sungguh dipasang ke empat cabang sayap jenis huruf | jenis huruf sistem |
| `--nabi-cursive-adjust` | `font-size-adjust` untuk sambung. Muka tulisan tangan punya x-height rendah sehingga tampak lebih kecil pada px yang sama, dan nilai ini mengukur ulang berdasarkan x-height | `0.4` |
| `--nabi-sticky-top` | seberapa jauh baris yang menempel turun. Jika situs punya header tetap, tingginya | `0px` |
| `--nabi-preview-width` | lebar kartu pratinjau. **`openPreview` mengukur lebar area edit saat dibuka dan menuliskannya langsung ke kartu**, sehingga nilai inline itu mengalahkan apa pun yang ditimpa dari luar | `720px` |

`--nabi-typeface-base` bukan dari golongan ini — **inti yang mendeklarasikannya** (bawaannya
mengikuti `--nabi-font`). Sayap jenis huruf tidak punya opsi untuk nilai ini, jadi timpa token
ini untuk mengubahnya.

`--nabi-keyboard-top` · `--nabi-keyboard-bottom` berdiri di tempat yang sama, tetapi ini
**ditulis oleh inti** — `mountSticky()` mengukur seberapa jauh keyboard ponsel mendorong layar
lalu menuliskannya ke sini, dan baris menempel serta layar penuh membaca nilai itu. Ini bukan
nilai yang ditulis tangan.

## Tempat tanpa token — timpa aturannya

Ketiga hal di bawah ini **tidak punya variabel.** Inti menanam nilainya langsung di aturan,
jadi untuk mengubahnya Anda menimpa selektornya.

**Empat tingkat ukuran huruf** — dalam `em`, sehingga mengikuti ukuran induknya.

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**Ukuran drop cap** — bukan jumlah baris yang dibungkus, melainkan satu ukuran huruf saja.
Berapa baris yang sungguh tertutup ditentukan oleh tinggi baris paragraf itu.

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**Warna token kode** — lembar gaya sayap kode menuliskan warna langsung ke
`[data-nabi-token]`. Saat ini **lima** golongan yang mendapat warna.

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

`type` yang dijawab penyorot adalah teks bebas — nama di luar kelima itu digambar tanpa warna,
jadi tambahkan sendiri aturan berbentuk sama untuk golongan yang ingin Anda pakai. Untuk warna
berbeda di gelap, tambahkan sendiri kondisi `.dark` — inti tidak membawa varian gelap untuk
kelima ini.

Animasi progres sayap unggah (`--nabi-per`·`--nabi-t`·`--nabi-span`·`--nabi-clear`·
`--nabi-blur-max`) adalah **urusan internal sayap itu sendiri** — namanya memang diawali
`--nabi-`, tetapi bukan tempat yang dibuka untuk ditimpa host.

---

## Ukuran luar memakai `rem`

Ukuran luar — tombol, jarak, chip toolbar, dan sebagainya — kebanyakan memakai `rem`, sehingga
**ikut membesar mengikuti ukuran huruf akar (`html`).** Bila pengguna memperbesar huruf di
peramban atau OS, bingkai editor pun ikut membesar. Untuk mengubah ukurannya, ubah `font-size`
akar. Garis (`border`) bukan ukuran melainkan **garis**, sehingga sebagian masih memakai `px`.

---

## Menghindari spesifisitas

Untuk menimpa token warna · bentuk, tumpuk **tiga kelas**.

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: var(--warna-aksen-saya);
}
```

Kalau dihitung, begini rinciannya. Aturan bawaan terang `:is(.nabi, …)` bernilai **(0,1,0)**
karena `:is()` mengikuti argumen tertingginya, sedangkan aturan gelap
`:where(html, body).dark :is(.nabi, …)` bernilai **(0,2,0)** karena `:where()` bernilai nol dan
`.dark` serta `:is()` masing-masing satu kelas. Jadi `.nabi.nabi` hanya **seri** dengan gelap —
dan pada keadaan seri, yang dimuat belakangan yang menang, dan lembar inti bisa saja dimuat
setelah lembar host. Tumpuk tiga agar naik ke (0,3,0) sehingga tidak bergantung pada urutan
muat.

Overlay pratinjau berdiri di luar `.nabi` (sebagai anak `body`), jadi selektornya juga harus
ditulis bersamaan agar mendapat warna yang sama.

**Token yang tidak dideklarasikan inti, seperti jenis huruf, tidak butuh pergulatan ini** —
karena tidak ada tempat deklarasinya, pewarisan saja sudah cukup sampai, jadi satu baris
`:root` sudah memadai.

```css
:root {
  --nabi-font: 'Noto Sans', system-ui, sans-serif;
}
```

---

## Terang · gelap

Kelas `dark` pada **salah satu** dari `html` atau `body` berarti gelap, `light` berarti
terang. Tanpa kelas, terang yang jadi bawaan, dan bila keduanya ada, `light` eksplisit yang
menang (aturan `.light` dimuat setelah aturan `.dark`).

```html
<html class="dark"><!-- atau <body class="dark"> --></html>
```

Toggle kelasnya dan CSS akan bereaksi. Tidak ada API untuk dipanggil. Yang diganti tema
hanyalah variabel warna, aturan komponen tetap sama — gaya buatan Anda sendiri pun ikut gelap
selama hanya memakai variabel `--nabi-*`.

---

## Dua jalan memasang lembar gaya

**① Satu berkas** — jalan yang paling umum. Berisi CSS semua sayap.

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**② Suntikkan hanya yang terdaftar** — untuk saat Anda hanya ingin lembar gaya dari sayap yang
sungguh dinyalakan.

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// panggil drop() dan hanya yang dimasukkan panggilan ini yang dicabut kembali
```

Lembar gaya dengan teks yang sama masuk **hanya sekali** — kunci lipatnya adalah **isi**
lembar itu, sehingga membuka beberapa editor dalam satu dokumen tidak menumpuk, dan
mencampur konfigurasi sayap yang berbeda pun terkumpul jadi satu gabungan.

::: tip Dua beda antara keduanya — apa yang dimuat, dan kapan ia melekat
**Apa yang dimuat.** Berkas tidak tahu sayap mana yang Anda daftarkan, jadi ia memuat
**semuanya**. Suntikan membaca `registry` dan hanya memuat **yang terdaftar**. Halaman yang
sekadar menampilkan HTML tersimpan tidak punya editor sehingga tidak punya `registry`, jadi ia
memakai jalan berkas.

**Kapan ia melekat.** Berkas masuk sebagai `<link>` di kepala (head) dan **menahan
penggambaran** sampai termuat, sedangkan suntikan baru melekat **setelah** JavaScript editor
tiba. Karena itu, halaman yang dokumennya sudah digambar lebih dulu di peladen lalu dikirim ke
browser sebaiknya memakai jalan berkas — bila memakai suntikan, dokumen yang dikirim peladen
akan tergambar telanjang dulu, baru gayanya menempel dan tata letaknya berubah lagi.
:::

Lembar gaya sayap yang Anda daftarkan masuk **setelah** lembar inti, sehingga pada prioritas
yang sama, sayap yang menang.

---

## Tempat yang bisa dibidik

Yang tidak bisa lewat variabel, bidik langsung kelas yang sungguh ada.

| Selektor | Apa | Siapa yang memasang |
|---|---|---|
| `.nabi` | cangkang yang membungkus seluruh editor (chrome + area edit). Token warna · bentuk melekat di sini | host |
| `.nabi-content[contenteditable]` | area edit itu sendiri | host |
| `.nabi-toolbar` | wadah yang membungkus baris toolbar + baris konteks. Kelas inilah yang "menempel di atas" | host |
| `.nabi-toolbar-row` | wadah tempat toolbar duduk | `mountToolbar()` |
| `.nabi-context` | wadah tempat baris konteks duduk | `mountContextToolbar()` |
| `.nabi-tools` | tempat dua tombol pratinjau · layar penuh — inti mengapungkannya di kanan atas | `mountViewTools()` |
| `.nabi-tool` | kedua tombol itu sendiri | `mountViewTools()` |
| `.tb-group` | kelompok tombol toolbar | `mountToolbar()` |
| `.ctb-group` · `.ctb-button` · `.ctb-swatch` · `.ctb-input` | kelompok, tombol, contoh warna, kolom teks baris konteks | `mountContextToolbar()` |
| `.tb-picker` · `.tb-picker-grid` · `.tb-picker-cell` | kotak yang muncul di bawah tombol, seperti kisi ukuran tabel | `mountToolbar()` |
| `.tb-prompt` · `.tb-prompt-input` | lapisan input alamat yang muncul saat menyisipkan sesuatu yang baru | `mountToolbar()` |
| `.nabi-hints [data-hint]` | lencana pintasan yang muncul saat Shift ditekan dua kali cepat — lencananya `::before`, labelnya `::after`, sehingga keduanya tampil bersama | `mountHints()` |
| `[data-nabi-tip]` | nama alat (tooltip) — hanya digambar lewat CSS `::after` | inti secara umum |
| `.nabi-content.nabi-dropping` | area edit selagi berkas sedang diseret ke atasnya. Teks panduan dibawa atribut `data-nabi-drop` | `mountUpload()` |

Pratinjau · layar penuh juga **dibangun oleh inti.**

| Selektor | Apa | Siapa |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > (`.nabi-close` · `.nabi-content.nabi-preview-body`) | overlay pratinjau dokumen | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | kotak untuk melihat satu gambar saja secara besar | `openImageLightbox()` |
| `.nabi.is-fullscreen` | layar penuh — mengunci kotak `.nabi` ke layar | `setFullscreen()` (nama kelasnya `FULLSCREEN_CLASS`) |

Pasang `mountViewTools()` dan kedua tombol itu akan membuka · menutup semuanya sendiri. Untuk
membukanya sendiri, panggil `openPreview({ nabi, editor })` ·
`openImageLightbox({ editor, src, alt?, locale })` · `setFullscreen(root, on)` ·
`isFullscreen(root)`.

::: tip Tempat alat berdiri sendiri
`mountViewTools` langsung membuat kotak `.nabi-tools` dan menaruhnya di paling depan wadah
yang Anda beri. Host tidak perlu menaruh `<span>` di depan toolbar sendiri — menyediakan
tempat lebih dulu justru membuat kotaknya jadi dua.
:::

Penanda khusus layar editor pun bisa dibidik — `[data-nabi-token]` (warna token blok kode),
`[data-nabi-lang]` (bahasa blok kode), `[data-color]` (stabilo · warna teks — dibedakan lewat
tag `<mark>` · `<span>`), `data-nabi-align`·`data-nabi-typeface`·`data-nabi-size`·
`data-nabi-dropcap` (atribut paragraf). Nama sungguhan penanda-penanda ini adalah konstanta
`*_ATTR` di berkas tiap wing — itulah rujukan resminya.

---

## Menggambar HTML tersimpan di tempat lain

Nilai keluar (`getHtml()`) adalah HTML dengan atribut `data-nabi-*` yang tersisa, dan **tanpa
satu karakter `style` inline pun.** Artinya rupa sepenuhnya urusan lembar gaya, sehingga
menggambarnya tanpa lembar gaya menghasilkan HTML polos tanpa perataan, tanpa ukuran huruf,
tanpa garis tabel.

Agar rupanya sama seperti di editor, bungkus dengan `.nabi-content` — kelas ini menerima
token warna · bentuk langsung tanpa perlu dibungkus `.nabi` (aturan
`.nabi-content:where(:not(.nabi *))` di `nabi.css`).

```html
<div class="nabi-content">HTML tersimpan</div>
```

Untuk lembar gayanya sendiri, pasang seperti pada「Dua jalan memasang lembar gaya」di atas —
bundler memakai `import 'nabi-note/nabi.css'`, selain itu satu `<link>` sudah cukup. Halaman
yang tidak menegakkan editor pun cukup punya `.nabi-content` agar lembar inti mendeklarasikan
tokennya.

### Perilaku sisi pembaca — pengurutan tabel

Saat ini baru **pengurutan tabel saja** yang keluar sebagai fungsi khusus sisi pembaca. Belum
ada sistem umum bagi sayap mana pun untuk memasang perilaku sisi pembacanya sendiri.

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'id' })
```

Ia mencari tabel berpenanda `data-nabi-sortable` dan memasang tombol urut di sel judulnya.
Fungsi pelepas (`detach`) mengembalikan tombol yang dipasang serta urutan baris yang diubah.

::: danger Jangan pasang pada elemen yang Anda edit
`attachTableSort()` memasang tombol ke DOM dan mengubah urutan baris. Bila DOM saat tombol
itu terpasang tersimpan, perubahan itu ikut membeku ke dalam nilai — pasang ini hanya pada
salinan baca-saja di sisi pembaca.
:::

---

## Berikutnya

- [{{ t('menu_wing_custom') }}](../wing/custom) — membuat format yang belum ada
- [{{ t('menu_intro_index') }}](../intro) — istilah yang dipakai dokumen ini

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
