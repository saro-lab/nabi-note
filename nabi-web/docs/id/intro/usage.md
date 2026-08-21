---
title: Cara pakai dasar
description: Pasang lewat npm, dirikan satu objek nabi, dan pindahkan dokumen lewat empat input dan tiga output.
---

# Cara pakai dasar

Ini jalan lewat npm. Jalan yang memakai satu baris `<script>` ada di
[{{ t('menu_intro_cdn') }}](./cdn).

```sh
npm i nabi-note
```

---

## Menyambungkan potongan-potongannya

Host menyiapkan tempatnya dan menempelkan mount satu per satu. Di bawah ini konfigurasi
minimalnya, dan contoh yang muncul di setiap dokumen wing semuanya adalah rangka ini
dengan satu-dua wing tambahan.

```html
<div id="app" class="nabi">
  <div id="chrome" class="nabi-toolbar">
    <div id="toolbar"></div>
    <div id="context"></div>
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountContextToolbar,
  mountHints,
  mountViewTools,
  mountSticky,
  watchSettle,
  parseNodes,
  boldWing,
  italicWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const app = document.querySelector<HTMLElement>('#app')!
const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar wing sekaligus merakit pengetahuan format, command, dan perakit — itulah `registry`
const { nabi, registry } = createNabiWith([boldWing, italicWing], {
  parseHtml: parseNodes,
})

mountSurface({ nabi, registry, root: surface })

const settle = watchSettle(document, { surface })
const shared = { nabi, registry, surface, settle, locale: 'id' }

const toolbar = mountToolbar({ ...shared, root: document.querySelector<HTMLElement>('#toolbar')! })
const context = mountContextToolbar({ ...shared, root: document.querySelector<HTMLElement>('#context')! })

mountHints({ toolbar, context, root: document.querySelector<HTMLElement>('#chrome')!, surface })
mountViewTools({ nabi, surface, root: app, container: document.querySelector<HTMLElement>('#toolbar')!, locale: 'id' })
mountSticky({ root: app, surface })

// Setiap kali nilainya berubah — pasang kode Anda di sini
// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Host yang menyiapkan tempatnya, dan **core yang tahu tempat itu berbentuk seperti apa**
— mount menempelkan sendiri `.nabi-toolbar-row`·`.nabi-context`·`.nabi-editing` ke
wadahnya, dan kotak alatnya pun berdiri sendiri. Artinya host tidak perlu menyusun
tata letak, dan karena itu markup di atas hanya punya tiga class.

- **`class="nabi"`** — Token warna dan sheet hanya hidup di dalam ini. Ini juga kotak
  yang dikunci penuh saat mode layar penuh, jadi toolbar dan area edit harus **bersama**
  di dalam ini.
- **`class="nabi-toolbar"`** — Menyatukan baris toolbar dan baris konteks jadi satu
  blok agar **menempel (sticky)** di atas. Kalau keduanya menempel terpisah, baris
  konteks yang muncul mendorong teks dan layar jadi bergoyang.
- **`class="nabi-content" contenteditable`** — Area edit itu sendiri.

Kalau situs punya header yang menempel, turunkan sejumlah itu dengan
`--nabi-sticky-top`, dan kalau memasang `mountSticky()`, core mengukur sendiri berapa
banyak keyboard mobile mendorong layar lalu mengembalikannya.

**Sheet dipasang oleh host.** Kalau memakai bundler, cukup satu baris
`import 'nabi-note/nabi.css'`; kalau hanya ingin membawa punya wing yang terdaftar,
panggil `injectSheets(document, collectSheets(registry))`.
**Halaman yang mengirim dokumen pre-render dari server harus memilih jalur file** —
injeksi baru terpasang setelah JavaScript editor tiba, jadi di antara itu dokumen
sempat digambar sekali dalam keadaan polos.

**Bahasa itu juga menentukan arah teks.** Kalau diberi bahasa Arab (`ar`) atau Urdu
(`ur`), akar mount itu mendapat `dir="rtl"` dan berdiri dari kanan ke kiri — bahkan
kalau halamannya sendiri tidak menyatakan apa-apa lewat `<html dir>`. Kalau `locale`
**tidak diberikan, tidak disentuh sama sekali**: tidak menimpa punya host yang sudah
mengatur arah sendiri. `localeDirection(code)` menjawab bahasa mana berarah apa.

```ts
mountSurface({ nabi, registry, root: surface, locale: 'ar' })   // Area edit jadi RTL
mountToolbar({ nabi, registry, surface, root: toolbar, locale: 'ar' })   // Toolbar pun jadi cerminan
```

Bahasa tampilan ditentukan `locale` per mount — teks dokumen tetap, hanya nama di
toolbar dan baris konteks yang berubah. **Host cukup mendeklarasikan locale satu
kali** — seperti contoh di atas, taruh dalam satu bungkusan (`shared`) dan berikan ke
semua mount; saat toolbar berdiri, ia memasang `locale`-nya sendiri ke core juga
(`nabi.$bindLocale`), sehingga pesan yang dikeluarkan core (toast dsb.) ikut dalam
bahasa yang sama. Untuk tempat yang tidak memakai toolbar, beri lewat opsi `locale`
di `createNabiWith`. Untuk menggambar pemilih bahasa, pakai `LOCALES` (daftar kode)
yang diekspor paket ini.

### Placeholder editor kosong

Editor yang benar-benar kosong menampilkan placeholder pudar di baris pertama.
Begitu satu huruf masuk, placeholder hilang, dan kalau dihapus sampai kosong lagi,
placeholder muncul lagi. **Muncul tanpa perlu apa-apa** — teksnya berasal dari kamus
core, jadi ikut bahasa mount itu. Posisinya ditentukan **arah teks** (kiri untuk LTR,
kanan untuk RTL) — meski baris itu diatur rata tengah atau kanan, placeholder tidak
ikut mengikutinya.

```ts
mountSurface({ nabi, registry, root: surface, placeholder: 'Tulis catatan di sini' })
mountSurface({ nabi, registry, root: surface, placeholder: 'Baris pertama\nBaris kedua' })   // beberapa baris
mountSurface({ nabi, registry, root: surface, placeholder: '' })   // tanpa placeholder
```

Baris baru (`\n`) langsung menjadi baris. Namun placeholder berdiri **di luar aliran
dokumen** (agar tidak mendorong caret), sehingga kalau area edit hanya setinggi satu
baris, placeholder beberapa baris akan meluber ke bawah — kalau mau memakai beberapa
baris, beri area edit tinggi minimum yang cukup.

Teksnya masuk lewat `--nabi-placeholder` di akar area edit, dan yang menggambarnya
adalah sheet. Untuk mengganti warna atau gaya, ubah aturan ini.

```css
.nabi-content.nabi-editing > :is(p, h1, h2, h3, h4, h5, h6):only-child:has(> br:only-child)::before {
  color: #999;
}
```

| Perakitan | Wajib | Yang dikerjakan |
|---|---|---|
| `createNabiWith(wings, options?)` | Ya | Mengembalikan `{ nabi, registry }`. Tidak butuh DOM. Menerima array wing, juga builder pemilih (`wings()`, lihat [{{ t('menu_intro_cdn') }}](./cdn#memilih-wing)) |
| `mountSurface({ nabi, registry, root })` | Ya | Menyelaraskan caret · IME · input ke NABI TREE. Juga memasang `attach` dari wing yang terdaftar |
| `mountToolbar({ nabi, registry, root, surface?, locale? })` | Tidak | Toolbar utama. Tanpa ini pun edit langsung lewat `applyCommand()` tetap bisa |
| `mountContextToolbar({ nabi, registry, root, surface? })` | Tidak | Baris konteks per posisi caret (baris/kolom tabel, bahasa kode, alamat/nama tautan, dst.) |
| `mountHints({ toolbar, context?, root, surface? })` | Tidak | Badge pintasan yang muncul saat Shift ditekan dua kali |
| `mountViewTools({ nabi, surface, root, container, onBody? })` | Tidak | Dua tombol pratinjau dan layar penuh. `root` adalah kotak `.nabi` yang dikunci layar penuh, `onBody` adalah hook untuk memasang runtime sisi-baca ke badan pratinjau (di bawah) |
| `mountSticky({ root, surface })` | Tidak | Mengembalikan toolbar yang terdorong sejumlah keyboard mobile mendorong layar |
| `mountPickedMark({ nabi, surface })` | Tidak | Tanda saat gambar/video terpilih (browser tidak menggambarnya sendiri) |
| `mountFile({ nabi, store, name? })` | Kalau memakai save·open | Simpan·buka lewat berkas `.nabi` |
| `mountLocalHistory({ nabi, storage })` | Kalau memakai localHistory | Mencatat ke browser tiap selang waktu tertentu. Tetap dirikan meski `storage` bernilai `null` (tempat terkunci seperti `file://`) — agar tombolnya bisa memberi tahu lewat toast kenapa tidak berfungsi |
| `mountUpload({ … })` + `mountUploadView({ … })` | Kalau memakai upload | Progres dan tampilan upload untuk drop · tempel · pilih berkas |

**Gambar · centang · drag kolom tabel · pewarnaan kode tidak butuh mount tersendiri**
— semuanya dipegang wing lewat `attach`, dan `mountSurface` memasangnya sekaligus.
Untuk pewarnaan kode, cukup pasang siapa yang mewarnai
(`makeCodeAttach`, lihat [{{ t('menu_wing_code') }}](../wing/block/code)).

### Memasang runtime sisi-baca ke pratinjau

Pratinjau hanyalah HTML statis dari `getHtml()` apa adanya, jadi hal-hal yang
**dikerjakan JavaScript di sisi baca** — seperti sortir tabel dan pewarnaan kode —
tidak otomatis terpasang. `attachViewer` dari `nabi-note/viewer` memasang semuanya
lewat satu pintu, dan di pratinjau, hook `onBody` adalah tempatnya — ubah baris
`mountViewTools` pada konfigurasi minimal di atas seperti ini.

```ts
import { attachViewer } from 'nabi-note/viewer'

mountViewTools({
  nabi,
  surface,
  root: app,
  container: document.querySelector<HTMLElement>('#toolbar')!,
  locale: 'id',
  onBody: (body) => attachViewer(body, { locale: 'id' }),
})
```

`onBody` dipanggil saat badan pratinjau berdiri, dan fungsi pelepas yang
dikembalikannya dipanggil saat overlay ditutup. Pasang **satu baris yang sama**
(`attachViewer`) di halaman yang sudah diterbitkan juga — karena pratinjau harus
sama dengan yang diterbitkan, memasang pintu yang sama di keduanya adalah inti hook
ini. Lebih lanjut di
[{{ t('menu_intro_cdn') }} ▸ Sisi baca](./cdn#sisi-baca).

Pewarnaan kode dijawab tokenizer bawaan secara default (nol dependensi). Host yang
memakai highlighter seperti Shiki mengoper hook yang sama lewat
`attachViewer(body, { locale, highlight })` — kalau sama dengan yang dioper ke
`makeCodeAttach({ highlight })`, warna di layar edit dan layar baca tidak akan
berbeda.

Untuk menukar wing, lepas semua potongan ini (`unmount()`) lalu buat ulang — markup
yang dipegang wing yang dilepas jatuh jadi teks polos di tempatnya. Demo di situs ini
memang bekerja seperti itu — coba matikan-nyalakan chip wing, dan perakitannya
dibangun ulang total.

Variabel CSS untuk warna dan bentuk ada di
[{{ t('menu_style_custom') }}](../style/custom).

---

## Tiga output dokumen

```ts
nabi.getHtml()        // HTML untuk disimpan/diterbitkan
nabi.getJson()        // NABI TREE (JSON)
nabi.getEditorHtml()  // HTML layar editor saat ini (disertai data-key)
```

**Yang disimpan adalah salah satu dari dua yang pertama.** `getEditorHtml()` membawa
penanda khusus layar (`data-key`) sehingga bukan nilai untuk disimpan — ini dipakai
saat menggambar editor lebih dulu lewat server-side rendering (SSR).

JSON yang keluar berbentuk seperti ini. **Dokumen adalah array blok**, tanpa node
akar pembungkus.

```json
[
  {"w":"p","a":{"h":2},"ch":["Judul"]},
  {"w":"p","ch":["Teks ",{"w":"b","ch":["tebal"]}," dan ",
    {"w":"a","a":{"href":"https://nabi.saro.me/"},"ch":["tautan"]}]},
  {"w":"p","a":{"a":"c"},"ch":["Rata tengah"]},
  {"w":"p","ch":[{"w":"ul","ch":[
    {"w":"li","ch":[{"w":"p","ch":["Satu"]}]},
    {"w":"li","ch":[{"w":"p","ch":["Dua"]}]}]}]}
]
```

Ada empat aturan membacanya.

- **`w` adalah id wing yang menggambar node itu.** Kata cadangannya hanya dua —
  `p` (paragraf) dan `br` (baris) — sisanya semua id wing yang terdaftar, seperti
  `b`·`ul`·`li`. Judul bukan wing tersendiri, melainkan **atribut paragraf**
  (`{"w":"p","a":{"h":2}}`).
- **Kalau string berarti teks, kalau objek berarti wing.** Tidak ada kolom terpisah
  untuk menyatakan jenisnya.
- **`a` adalah nilai yang dibawa wing itu** — alamat tautan, warna stabilo, level
  judul, dan semacamnya. Kalau tidak ada, kolomnya pun tidak ada. Nilai perataan juga
  masuk `a`, tapi **di dalam** kolom itu sehingga tidak membingungkan
  (`{"w":"p","a":{"a":"c"}}` — paragraf rata tengah).
- **Sesuatu yang menempati posisi paragraf seperti tabel · daftar · gambar dibungkus
  satu lapis paragraf** (lihat `ul` di atas). Paragraf itu yang menanggung perataan,
  dan menyediakan tempat caret berdiri di depan-belakang benda itu. Dalam HTML keluar
  sebagai `<div data-nabi-p>` — karena `<p>` secara sintaks tidak bisa membungkus
  tabel atau daftar.

Tree yang berjalan di dalam punya satu kolom tambahan per node, `_id` — **alamat
internal tempat caret menunjuk node** — yang dinomori ulang pada kebanyakan edit dan
dilepas saat keluar (pada contoh di atas: 470 → 323 byte). Nilai yang keluar bisa
langsung dimasukkan lagi ke `setJson()`.

---

## Empat input dokumen

```ts
createNabiWith(wings, { doc })   // Mulai dari NABI TREE yang sudah jadi
nabi.setJson(json)               // Ganti total dengan NABI TREE
nabi.setHtml(html)               // Ganti total dengan string HTML
nabi.applyCommand('setHeading', { value: 2 })  // Command edit (pintu yang dipakai wing)
```

Keempatnya **menjawab berhasil-tidaknya sebagai `boolean`.** Tidak melempar galat,
dan kalau gagal, dokumen tidak disentuh. Nilai yang sedikit menyimpang tidak ditolak,
melainkan **diperbaiki saat dibaca** — kolom tabel kosong, anak tabel yang bukan
baris, penggabungan sel yang melebihi batas, dan semacamnya termasuk di sini, begitu
juga alamat berbahaya yang disaring lewat langkah yang sama. Penolakan hanya untuk
bentuk yang sama sekali tidak bisa dibaca. Dan kalau ada nilai yang melempar
exception di tengah pembacaan, editor tidak berhenti — berubah jadi penolakan
(`false`), dan `console.error` memberitahu apa yang ditolak.

| Tempat jawabannya `false` | |
|---|---|
| `setJson` | Bukan bentuk NABI TREE (kecuali nilai kosong — di bawah) |
| `setHtml` | Adaptor `parseHtml` belum dipasang (di bawah), atau editing terkunci (kecuali nilai kosong) |
| `applyCommand` | Command itu tidak ada, atau **tidak ada yang berubah** |

**Bentuk dokumen kosong hanya satu — `[{"w":"p","ch":[]}]`.** Untuk tempat yang
seluruh isinya dihapus (misalnya pilih semua lalu hapus), judul dan perataan blok
pertama tidak ikut tersisa. Ini berbeda dengan mengosongkan satu baris di antara
beberapa baris — karena maksudnya menulis ulang baris itu, atribut paragrafnya tetap
dipertahankan.

**Nilai kosong bukan galat format, melainkan dokumen kosong.** Memberi `null`·
`undefined`·string kosong (termasuk yang hanya spasi)·array kosong tidak ditolak —
editor **duduk sebagai layar kosong dan menjawab `true`** — berlaku untuk
`setJson`·`setHtml` keduanya, sehingga "mengosongkan" selalu berhasil. Karena nilai
kosong tidak ada yang perlu dibaca, `setHtml` pun tidak membutuhkan adaptor (di
bawah) saat itu. Nilai yang bentuknya memang salah tetap ditolak — kosong dan salah
adalah dua hal berbeda.

Baris terakhir adalah satu aturan — **kalau tidak ada yang berubah, tetap diam.**
Memanggil `setHeading` lagi pada paragraf yang sudah H2 menjawab `false`, tanpa
meninggalkan titik undo atau sinyal apa pun.

Argumen ketiga `applyCommand` adalah **tangan pemanggilnya** — `by` pada
`applyCommand(name, args?, by?)` bertipe `'keyboard' | 'pointer'` (tipe
`CommandHand`), dan kalau tidak disebutkan dianggap keyboard. Bedanya muncul di satu
tempat: command mark saat caret dalam keadaan collapsed akan dipesan dulu kalau lewat
keyboard (berlaku mulai huruf berikutnya), tapi kalau lewat pointer, langsung
menjawab `false` tanpa pemesanan dan memberi toast "tidak ada yang bisa dikenai".
Kalau membangun UI sendiri untuk memanggil command, sebutkan `'pointer'` di handle
klik itu.

### `setHtml` membutuhkan adaptor

Pembacaan HTML dilakukan `DOMParser` milik browser. Core tidak tahu apa-apa tentang
DOM, jadi adaptor itu dipasang saat mendeklarasikan wing.

```ts
import { createNabiWith, parseNodes } from 'nabi-note'

const { nabi } = createNabiWith(wings, { parseHtml: parseNodes })
```

`setJson` tidak membutuhkan adaptor — JSON yang tersimpan **bisa dimasukkan langsung
di server (Node.js)** apa adanya. Perakitan (`getHtml`) pun tidak memakai DOM,
sehingga jalan untuk membaca JSON di server dan mengeluarkan HTML tetap terbuka.

---

## Notifikasi keluar lewat toast

Galat upload, pemberitahuan riwayat lokal, "tidak ada yang bisa dikenai", dan
pesan-pesan singkat sejenisnya semua keluar lewat **satu jalur toast**. Wadah
bawaannya sudah dipegang core sehingga tidak perlu memasang apa-apa — kalau toolbar
berdiri, muncul di posisi tetap sedikit di bawah toolbar (posisi ini tidak bergerak
meski baris konteks muncul-hilang).

- Ada tiga tingkat — `'info' | 'warn' | 'error'`. Ini bukan hasil sukses/gagal,
  melainkan tingkat **seberapa tegang pembacanya harus bersiap.**
- Default hilang setelah 1 detik (mulai pudar 0.5 detik sebelum habis), dan bisa
  ditutup dengan klik. Yang berdiri bersamaan defaultnya maksimal 3 — kalau lebih,
  yang waktu sisanya paling sedikit yang hilang duluan.
- Pesan bisa mengandung `\n`, dan tergambar baik di tema terang maupun gelap.

Ada dua opsi untuk mengubah gaya dan satu opsi untuk mengganti total tampilannya,
semua di `createNabiWith`.

```ts
const { nabi } = createNabiWith(wings, {
  toastMs: 2000,   // Lama hidup — default 1000ms. Bisa ditumpuk per panggilan juga
  toastMax: 5,     // Batas yang berdiri bersamaan — default 3
  // Halaman yang punya sistem notifikasi sendiri cukup mengganti tampilannya — wadah bawaan core tidak pernah digambar
  // toast: (level, message, ms) => user_callback(level, message),
})
```

Wing pun berbicara lewat pintu yang sama — `nabi.$toast(level, message, ms?)`. Karena
durasinya dioper bersama pesan, tidak perlu menaikkan default global hanya untuk satu
pemberitahuan panjang.

---

## Cara editor bertanya kepada manusia

Saat membuka berkas, dibutuhkan pertanyaan seperti "Ada teks yang belum disimpan.
Tetap buka?". Kotak itu dipasang **sekali saat deklarasi.**

```ts
const { nabi } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

| | Bentuk |
|---|---|
| `message` | `(text: string) => void` — satu pesan, tanpa menerima jawaban |
| `confirm` | `(text: string) => boolean \| Promise<boolean>` — menerima sinkron maupun asinkron |

**Core tidak otomatis memakai punya browser.** Kotak abu-abu bawaan browser tidak
boleh menyela halaman yang sudah punya dialognya sendiri, dan plugin (IntelliJ, VS
Code) bahkan tidak punya `window.confirm` sama sekali. Ketiga baris di atas dibangun
oleh host.

**Hanya yang dipasang yang berlaku** — bisa memasang `message` saja, atau `confirm`
saja. `message` yang tidak dipasang keluar lewat core toast (info) di atas, dan
jawaban `confirm` yang tidak dipasang adalah "tidak".

::: warning Kalau confirm tidak diberi, jawabannya "tidak"
Pertanyaan yang tidak dijawab siapa pun bukan berarti "ya" — sama seperti arti
batal · Escape · menutup jendela. Karena jawaban ini menentukan "buang tulisan yang
belum disimpan dan tetap buka?", tidak ada yang menjawab tidak boleh diartikan
sebagai membuang. Di server (Node) pun nilai ini yang dilewati secara diam-diam.
:::

**Ini milik satu editor** — bukan global, sehingga dua editor di satu halaman bisa
bertanya secara berbeda. Wing menerima yang sama juga (`nabi.$ask`) —
ceritanya ada di
[{{ t('menu_wing_custom') }} ▸ UI dan perilaku](../wing/custom/ui).

---

## Nama editor ini dan "sudah berubah?"

```ts
nabi.sessionId   // '1755245678901-1x9k3af' — <waktu unix>-<nonce>, satu per instance
nabi.isChanged() // Apakah dokumen bergerak sejak garis dasar terakhir
```

`sessionId` dibuat sekali dan tidak berubah. Waktunya menandai kapan editor ini
berdiri dan otomatis terurut, dan nonce membedakan dua editor yang berdiri di
milidetik yang sama. Ini label untuk kunci draft, log, dan autosave.

**Ada tiga hal yang menggambar ulang garis dasar `isChanged()`**: memasukkan dokumen
secara total (`createNabiWith({ doc })`·`setJson()`·`setHtml()`), dan memberitahu
bahwa sudah disimpan.

```ts
nabi.$markSaved(savedDoc)   // Setelah penyimpanan berhasil — oper dokumen yang tersimpan pada saat itu
```

**Oper tree pada saat penyimpanan itu terjadi** (bukan tree sekarang). Ini karena
huruf yang diketik selama proses simpan yang lama harus tetap dianggap "berubah".
Wing save (`save`) memanggil ini setelah berkas benar-benar tertulis, jadi kalau
disimpan sebagai `.nabi`, `isChanged()` menjadi `false`.

**Kembali ke posisi awal membuatnya `false` lagi** — karena NABI TREE bersifat
immutable dan berganti total di setiap edit, editor tahu itu dokumen yang sama tanpa
perlu memindai atau meng-hash.

```ts
window.addEventListener('beforeunload', (e) => {
  if (nabi.isChanged()) e.preventDefault()
})
```

---

## Dokumen berikutnya

- [{{ t('menu_intro_ssr') }}](./ssr) — Menggambar dokumen tersimpan lebih dulu di server, lalu menyambungkannya dengan `hydrate`
- [{{ t('menu_intro_cdn') }}](./cdn) — Cukup satu `<script>`, tanpa alat build
- [{{ t('menu_wing_custom') }}](../wing/custom) — Membuat sendiri format yang belum ada

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
