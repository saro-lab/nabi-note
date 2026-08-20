---
title: Daftar berpoin
---

# Daftar berpoin

## Penjelasan

`bulletListWing` (nama `ul`, pintasan `L`) memiliki `<ul>`. Item dibawa bersama lewat
`parts`, jadi `li` tidak didaftarkan terpisah — bukan array, melainkan rekaman (record).

```ts
parts: { li: { holds: 'blocks' } }
```

Menekan tombolnya membungkus blok tempat karet berada (atau blok-blok yang tercakup
pilihan) menjadi daftar, dan menekannya lagi melepasnya sehingga kembali menjadi
paragraf. Menekan tombol daftar lain menggantinya ke jenis itu.

Mengetik tanda hubung di awal baris lalu spasi (`- `) juga memberi hasil yang sama.
**Baris tidak perlu kosong** — yang diperiksa hanya awal baris di depan karet, jadi
menekan spasi pada `- teks-setelahnya` tetap terpicu dan teks setelahnya tetap ada di
dalam item. Namun ini hanya terpicu pada **baris pertama** paragraf.

- `Tab` menggeser item satu tingkat ke dalam, menjadi anak dari item saudara tepat di
  atasnya. Item pertama tidak punya tempat untuk masuk sehingga tidak terjadi apa-apa
  — di dalam daftar, `Tab` tidak menyisipkan spasi.
- `Shift+Tab` menggesernya ke luar, menjadi saudara berikutnya dari induknya —
  menggesernya ke luar dari tingkat teratas mengeluarkannya dari daftar dan
  menjadikannya paragraf. Jika beberapa item sudah dipilih sekaligus, semua item yang
  tercakup bergerak bersama.
- **Menekan Enter pada item kosong menggeser ke luar.** Jika item itu ada di tingkat
  teratas, daftar berakhir di situ dan karet berpindah ke paragraf baru di bawahnya.
  Inilah cara mengakhiri daftar.
- **Menekan Backspace di awal item menggabungkannya dengan item sebelumnya.** Jika
  tidak ada item sebelumnya untuk digabung, ia jatuh menjadi geser-keluar. Menekan
  Delete di akhir item sebaliknya menarik item berikutnya masuk.
- Isi sebuah item adalah blok, jadi ada satu lapis paragraf di dalamnya. Tanda (tebal
  dan lainnya) serta sayap inline lain dapat dipakai apa adanya di dalam paragraf itu.
- Atribut yang sebelumnya dibawa tagnya, seperti `type`, tidak bertahan. Jika sesuatu
  yang bukan item masuk ke dalam daftar, ia tidak dibuang melainkan dibungkus menjadi
  satu item.
- Daftar centang berbagi tag (`<ul>`) tetapi merupakan sayap yang berbeda — yang
  memisahkannya adalah atribut penanda (jika ada `data-nabi-list="task"`, itu daftar
  centang).

## Penyarangan adalah markup sungguhan

Struktur tersimpan apa adanya pada nilai tersimpan. Namun karena **item membawa blok,
bukan teks**, teks mengenakan satu lapis paragraf dan daftar yang disarangkan berdiri
di dalam paragraf pembungkus.

```html
<li><p>a</p><div data-nabi-p><ul><li><p>b</p></li></ul></div></li>
```

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar sayap membangun pengetahuan jenis, perintah, dan perakit sekaligus — itulah `registry`
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li` ikut terbawa secara otomatis lewat `parts`, jadi ia tidak dimasukkan sendiri ke
dalam array.

## Demo

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
