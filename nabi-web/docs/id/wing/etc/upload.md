---
title: Unggah berkas
---

# Unggah berkas

## Penjelasan

Unggah terbagi tiga bagian — mendaftarkan sayapnya saja tidak berbuat apa-apa.

1. **`uploadWing`** — memasang tombol pilih berkas di toolbar. Sayap ini sendiri tidak
   membuat `img` maupun `a` — berkas yang terunggah dikomit sebagai sesuatu yang digambar
   sayap gambar atau tautan, jadi **`imageWing` atau `linkWing` harus didaftarkan
   bersamanya** agar hasilnya tersimpan di dokumen. Tanpa salah satunya, **kesalahan langsung
   muncul di tempat pendaftarannya** (tidak meledak belakangan).
2. **`mountUpload({ … })`** — sisi yang sungguh menerima berkas dan menjalankan `uploader`.
   Drop, tempel, dan pilihan berkas semuanya mengalir ke sini. **Lewatkan mount ini dan
   tombolnya ada tetapi tidak terjadi apa-apa.**
3. **`mountUploadView({ … })`** — sisi yang menegakkan placeholder progres di layar. Tanpanya
   unggahan tetap berjalan, tetapi layar tidak berkata apa-apa selama proses berlangsung.

`uploader` berbentuk `(task) => Promise<{ uri } | null>` — **menjawab URI berarti berhasil,
`null` berarti gagal** dan placeholder-nya pun disingkirkan. Laporkan progres lewat
`task.onProgress(0~100)`, dan berhenti ketika `task.signal` dibatalkan.

Batasannya ada tiga — `extensions`·`maxFileSize`·`maxTotalSize` — semuanya opsional (0 atau
tidak diisi berarti tanpa batas). Berkas yang tersaring datang lewat `onReject`.

## Yang tersisa setelah terunggah

Gambar dikomit sebagai blok `imageWing`, berkas lainnya sebagai tautan lampiran `linkWing`.

- **Nama lampiran bukan nama berkas melainkan label i18n** — "Lampiran" dalam bahasa
  Indonesia. Nama berkas biasanya terlalu panjang untuk ditinggalkan di dokumen, dan yang
  lebih penting, namanya harus bisa diubah. Ubah dengan menaruh karet di tautan itu lalu
  memakai [kolom nama di baris konteks](../inline/link).
- **Ekstensi tetap tersisa sebagai penanda** — `data-nabi-file="pdf"`. Nilai ini diambil dari
  nama berkas asli, dan lembar gayalah yang menggambarnya sebagai lencana. Mengubah nama
  tidak menghilangkan penandanya.
- Alamat yang ditolak sayap tautan (misalnya `blob:` yang datang tanpa `allowLocalUrls`
  dinyalakan) diturunkan menjadi nama berkas polos — daftar putihnya tidak pernah dilewati.

## Yang tampak selama proses unggah

Selama unggah berlangsung, kotak sementara berdiri di tempatnya — hanya ada di DOM editor,
tidak di pohon nabi, sehingga tidak satu karakter pun tersisa di nilai tersimpan.

- **Gambar** langsung menampilkan pratinjau dari berkas yang dipilih, dengan kisi menutupinya
  di atas. Sel kisi tersingkap satu per satu seiring progres hingga gambarnya jelas. Urutan
  sel yang tersingkap diacak per berkas, sehingga mengunggah beberapa sekaligus tidak
  mengulang pola yang sama.
- **Berkas yang bukan gambar** mendapat kotak tanpa kisi — klip 📎 dan label "Lampiran" —
  dengan ekstensi tampil sebagai lencana huruf besar (`PDF` dan sejenisnya). Gambar yang
  pratinjaunya gagal digambar pun jatuh ke sini.
- Progres dibawa kotak lewat `data-nabi-per` dan digambar lembar gaya. Selama unggah, setiap
  kotak punya tombol batal (×), dan pengeditan terkunci selama satu batch berjalan.

## Contoh penggunaan

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountUpload,
  mountUploadView,
  imageWing,
  linkWing,
  uploadWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// unggah baru bisa meninggalkan hasil bila ada sayap gambar · tautan — tanpanya, kesalahan langsung muncul di sini
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// sisi yang menegakkan placeholder progres — buat dulu, baru disambungkan di bawah
const view = mountUploadView({ nabi, surface, locale: 'id' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'id',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  uploader: async (task) => {
    // taruh di sini kode yang sungguh mengunggah ke server. menjawab URI berarti berhasil, null berarti gagal
    // const uri = await user_callback(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi, registry, surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  // ke sinilah berkas yang dipilih dari tombol berkas toolbar mengalir
  onFiles: (files) => upload.take(files),
})
```

## Demo

Situs ini tidak punya server untuk diunggah, jadi hanya berpura-pura — mengembalikan alamat
`blob:` yang dibuat `URL.createObjectURL()`. Hasilnya hanya bertahan di dalam halaman ini
saja.

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
