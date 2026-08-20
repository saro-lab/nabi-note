---
title: Daftar tugas
---

# Daftar tugas

## Penjelasan

`taskListWing` (id `tl`, pintasan `K`) berbagi tag (`<ul>`) dengan daftar berpoin,
tetapi merupakan implementasi tersendiri — saat keluar, `data-nabi-list="task"`
menyatakan bahwa ini daftar tugas, dan `data-nabi-checked` pada tiap item menyatakan
status centangnya.

Item dibawa bersama lewat `parts` — bukan berupa larik, melainkan **rekaman (record)**.

```ts
parts: { tli: { holds: 'blocks', boolAttrs: ['ck'] } }
```

Pada nilai tersimpan, centang disebut `ck` dan hanya bernilai `1` — status mati
bukan `0`, melainkan **kolomnya sama sekali tidak ada**. Pada HTML keluaran, ini
diuraikan menjadi `data-nabi-checked="true"`/`"false"`.

Menekan tombolnya membungkus blok tempat karet berada (atau blok-blok yang dilalui
seleksi) menjadi daftar tugas. Mengetik `[ ] ` atau `[x] ` (huruf besar-kecil tidak
dibedakan) di awal baris memberi hasil yang sama, dan tergantung mana yang Anda
ketik, itemnya mulai sudah tercentang sejak awal. Tidak perlu baris kosong — ini
hanya berlaku pada baris pertama paragraf.

Kotak centangnya bukan `<input>`, melainkan penanda yang digambar dengan CSS —
menaruh input sungguhan di dalam `contenteditable` akan mengacaukan karet. Kolom
yang menyala berupa tanda ✕ putih di atas ubin warna aksen, dan barisnya memudar
serta dicoret.

**Tempat menyalakan dan mematikan adalah kolom itu sendiri** — hanya menekan pita
sempit (kira-kira selebar satu huruf) di depan item yang mengubah statusnya;
menekan bagian teks hanya memindahkan karet. Pada tulisan kanan-ke-kiri, pita itu
berpindah ke sisi seberang. Ini ditangani wing lewat `attach`, jadi **tidak ada yang
perlu di-mount terpisah.**

`Tab`/`Shift+Tab` untuk menambah-kurangi indentasi, dan mengakhiri daftar dengan
Enter pada item kosong, bekerja sama seperti pada [daftar berpoin](./bullet-list).

## Contoh penggunaan

```ts
import { createNabiWith, mountSurface, mountToolbar, taskListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Daftar wing sekaligus membangun pengetahuan skema, perintah, dan perakit — itulah `registry`
const { nabi, registry } = createNabiWith([taskListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/task-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
