---
title: UI dan aksi
description: Tombol toolbar (button), baris konteks (context), lembar gaya (styles) — tiga tempat wing berdiri di hadapan pengguna.
---

# UI dan aksi

Ada tiga tempat wing berdiri di hadapan pengguna.

| Kolom | Di mana |
|---|---|
| `button` · `buttons` | **Toolbar** di atas — tempat yang selalu terlihat |
| `context` | **Baris konteks** — tempat yang hanya muncul untuk yang sedang disentuh kursor |
| `styles` | **CSS** yang dibawa wing ini |

---

## Tombol toolbar

```ts
button: {
  group: 'emphasis',                   // di kelompok mana ia berdiri — wajib
  svg: '<path d="…"/>',                // isi pada grid 16×16. Tanpa ini berdiri sebagai huruf
  label: { id: 'Tebal' },
  shortcut: 'B',                       // huruf ini dalam mode petunjuk
  accelerator: 'mod+b',                // kombinasi Ctrl/⌘
  action: { kind: 'mark' },
}
```

Jika tombolnya lebih dari satu, tulis dalam array di `buttons` — begitulah satu
wing perataan berdiri sebagai kiri, tengah, kanan sekaligus. Saat itu `name`
membedakannya satu sama lain dan `value` menuliskan nilai yang diwakili masing-masing.

### `group` — kelompok menentukan urutan

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

**Urutan ini sudah dipaku.** Di mana pun wing dimasukkan ke dalam array, tombolnya
tetap berdiri di tempat kelompoknya. Hanya di dalam kelompok yang sama urutan
pendaftaran berlaku. Nama yang tidak ada di daftar membuat kelompok baru berdiri
paling belakang.

Saat sebuah kelompok kosong seluruhnya (semua tombol di dalamnya tersembunyi),
kelompok itu hilang dari layar — tidak menyisakan garis pemisah yang kosong.

### `action` — apa yang terjadi saat ditekan

| `kind` | Yang dilakukan | Yang ditulis bersamanya |
|---|---|---|
| `'mark'` | Pergi ke toggle mark milik core. **Command tidak perlu ditulis** | — |
| `'command'` | Menjalankan satu command | `command` · `args?` |
| `'menu'` | Membentangkan daftar nilai sebagai panel | `command` · `argKey` · `values` |
| `'grid'` | Membentangkan kisi baris×kolom (menyisipkan tabel) | `command` · `rowsKey` · `colsKey` · `max?` |
| `'prompt'` | Menampilkan kolom isian dan menyerahkan nilainya ke command | `command` · `fields` |
| `'file'` | Membuka jendela pemilih berkas | `accept?` · `multiple?` |
| `'host'` | Menyerahkan ke host (`onHost` milik `mountToolbar`) | — |

Jika `action` tidak ditulis, tombol itu tidak melakukan apa-apa saat ditekan.

### `shortcut` dan `accelerator`

| | Bentuk | Aturan |
|---|---|---|
| `shortcut` | `'B'` | **satu huruf besar latin atau angka** |
| `accelerator` | `'mod+b'` | `mod+` diikuti **satu huruf kecil** |

Keduanya **mati di tempat pendaftaran jika bentrok antarwing.** Tidak ada salah
satunya yang diam-diam berhenti bekerja belakangan.

Jika `accelerated` ditulis terpisah, menekan lewat accelerator memicu aksi yang
berbeda — misalnya menekan tombol membuka panel, sementara <kbd>Ctrl</kbd>+huruf
langsung memasang nilai bawaan.

---

## Cara terlihat sedang ditekan

Hanya ada satu dasar untuk mewarnai tombol sebagai "sedang menyala".

| `place` | Yang dilihat |
|---|---|
| `'mark'` | Apakah mark itu ada di posisi kursor |
| `'attr'` | `currentValue` milik paragraf tempat kursor berdiri |
| `'container'`·`'void'` | Apakah kursor berada di dalam atau di atas benda itu |
| `'tool'` | **Selalu mati** |

Wing dengan banyak nilai (perataan, judul) menulis `value` di setiap tombol, dan
hanya tombol yang nilainya sama dengan jawaban `currentValue` milik wing yang
diwarnai.

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

**`currentValue` menjawab dengan huruf (string)** — walau nilainya angka, tetap
dipindahkan lewat `String()`. `undefined` berarti "node ini tidak punya nilai saya".

---

## Tombol bersembunyi sendiri di tempat yang tidak bisa ditempatinya

| `place` | Kapan bersembunyi |
|---|---|
| `'mark'` | Di tempat yang hanya berisi huruf (semacam di dalam kotak kode), saat ia pemilik tempat itu |
| `'attr'` | Saat kursor berada di atas paragraf pembungkus yang berisi benda. **Hanya perataan (`a`) yang jadi pengecualian** |
| `'void'`·`'container'` | Di tempat yang hanya berisi huruf, atau saat `allows` wadah sekarang tidak menerimanya |
| `'tool'` | Tidak pernah bersembunyi |

Perataan menjadi pengecualian dengan alasan yang sama seperti sebelumnya — perataan
benda bukan dimiliki benda itu sendiri, melainkan dimiliki paragraf pembungkus yang
menampungnya. Menekan "tengah" harus bisa dilakukan sambil berdiri di atas gambar.

Menuliskan `allows` membuat **toolbar mengikuti dengan sendirinya.** Hilangnya
tombol tabel di dalam kotak kode bukan aturan yang ditulis terpisah, melainkan
akibat dari satu kolom `allows` itu saja.

---

## Baris konteks

Baris yang hanya muncul untuk yang sedang disentuh kursor. Menekan gambar
memunculkan pengatur ukuran, meletakkan kursor di tautan memunculkan kolom alamat
— begitulah tempat ini bekerja.

```ts
context: {
  title: { id: 'Catatan' },
  controls: [
    {
      kind: 'select',
      name: 'tone',
      label: { id: 'Nada' },
      command: 'setNoteTone',
      argKey: 'value',
      attr: 't',                                    // kolom atribut tempat membaca nilai sekarang
      values: [
        { value: 'info', label: { id: 'Info' } },
        { value: 'warn', label: { id: 'Peringatan' } },
      ],
    },
  ],
}
```

### Kapan muncul

**Semua yang disentuh** di posisi kursor membentangkan barisnya masing-masing.

- Wadah-wadah di jalur kursor (yang paling dalam lebih dulu, yang paling luar
  belakangan)
- Benda yang sedang dibidik (gambar yang terpilih di atas paragraf pembungkusnya,
  misalnya)
- **Mark-mark** yang terpasang di posisi kursor — berbeda dari tombol toolbar,
  mark pun punya baris konteksnya sendiri
- Wing **atribut paragraf** yang nilainya dipegang paragraf tempat kursor berdiri

Meletakkan kursor pada tautan di dalam tabel memunculkan baris tautan dan baris
tabel sekaligus.

### Tujuh jenis `ContextControl`

| `kind` | Apa itu | Yang ditulis bersamanya |
|---|---|---|
| `'button'` | Sekali tekan, satu command | `command` · `args?` |
| `'toggle'` | Dua status, nyala/mati | `command` · `token` |
| `'select'` | Satu dari daftar | `command` · `argKey` · `values` · `attr?` |
| `'range'` | Menggeser skala (mengatur ukuran) | `command` · `argKey` · `values` · `rest?` · `readout?` |
| `'text'` | Satu kolom huruf (alamat tautan) | `command` · `argKey` · `initial?` · `placeholder?` · `validate?` |
| `'prompt'` | Beberapa kolom sebagai panel | `command` · `fields` |
| `'lightbox'` | Melihat dalam ukuran besar | `src` · `alt?` |

Ketujuhnya berbagi `name` (wajib) · `label?` · `svg?` · `tip?` · `visible?`.

`visible: (node) => boolean` adalah pintu untuk **menyembunyikan kolom di dalam
wing yang sama** — misalnya hanya memperlihatkan "lepas gabungan" pada sel yang
sudah tergabung.

Menuliskan `attr` membuat nilai sekarang langsung dibaca dari kolom atribut itu
untuk diwarnai. `'toggle'` memakai `token` untuk dibandingkan dengan huruf yang
dijawab `currentValue`.

---

## `styles` — CSS yang dibawa wing

```ts
styles: `
.nabi-content aside[data-nabi-note] {
  border-inline-start: 3px solid var(--nabi-accent);
  padding: .6rem .9rem;
  background: color-mix(in srgb, var(--nabi-accent) 8%, transparent);
}
`
```

Ada empat aturan.

- **Batasi hanya di bawah `.nabi-content`.** Tidak boleh menular ke tulisan lain
  di halaman host.
- **Ukuran huruf ditulis dalam `rem` atau `em`.**
- **Bedakan mode gelap hanya lewat kelas `.dark`.** Membedakannya lewat media
  query membuat editor menjadi gelap sendirian di layar terang yang dipilih host.
- **Ukur lebar dan sempit dengan container query.** Patokannya adalah lebar
  tempat editor berada, bukan lebar layar.

Jika hanya ingin memuat yang terdaftar, kumpulkan dan sisipkan sendiri.

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const detach = injectSheets(document, collectSheets(registry))
```

Lembar gaya dengan tulisan yang sama hanya dimuat **sekali** — beberapa wing boleh
berbagi CSS yang sama dan hanya satu salinan yang menempel di dokumen. Jawabannya
adalah fungsi pelepas, dan **hanya yang baru dipasang panggilan ini** yang dilepas.

---

## Bertanya kepada pengguna

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

`confirm` menerima `boolean` maupun `Promise<boolean>` — boleh langsung
menyambungkan `confirm` bawaan browser, boleh juga menampilkan panel buatan
sendiri dan menjawabnya belakangan.

::: warning Jika tidak dipasang, jawabannya selalu "tidak"
Jika `ask` tidak dipasang, bawaan yang senyap yang berlaku. `message` tidak pergi
ke mana-mana dan `confirm` menjawab `false`. Alasannya, **bertanya-lalu-menghapus
yang diam-diam tidak terjadi** dianggap lebih baik daripada diam-diam terjadi.
"Benar-benar ingin menghapus?" pada riwayat lokal melewati pintu ini.
:::

::: tip Command tidak bisa bertanya
Command adalah fungsi murni sehingga tidak tahu layar maupun waktu. Hal yang perlu
ditanyakan harus ditanyakan di luar command dan command dipanggil **setelah
jawabannya keluar.** Di dalam wing, tempat untuk itu adalah `attach`, dan di sana
dijangkau lewat `host.nabi.$ask`.
:::

---

## Dokumen berikutnya

- [Mark inline](../custom/inline) · [Blok dan atribut paragraf](../custom/block) ·
  [Tombol, transformasi otomatis, tempel](../custom/input)
- [Tema dan variabel CSS](../../style/custom) — nama-nama variabel yang diandalkan lembar gaya

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
