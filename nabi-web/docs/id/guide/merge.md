---
title: Penggabungan
description: Gabungkan versi awal pengeditan, versi Anda, dan versi yang tersimpan sementara itu, lalu edit konflik tersisa untuk menyelesaikannya.
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# Penggabungan

Jika perubahan lain tersimpan saat Anda mengedit, gabungkan kedua sisi dengan versi awal sebagai dasar. Semua perubahan yang dapat digabung otomatis langsung diterapkan; hanya tumpang tindih menjadi konflik. Ini tampilan mandiri `nabi-note/merge`, bukan wing.

| Kiri | Tengah | Kanan |
| --- | --- | --- |
| Versi saat mulai mengedit | Dokumen Anda dengan penggabungan otomatis | Versi tersimpan selama Anda mengedit |
| Hanya baca | Bisa diedit langsung | Hanya baca |

Di tengah, edit teks, format, tabel, daftar, dan gambar seperti editor biasa. Wing yang diberikan menentukan fitur. Penanda konflik dan status penyelesaian tidak masuk ke konten tersimpan.

## Contoh yang seluruhnya tergabung otomatis

Anda mengubah waktu rapat menjadi **pukul 11.00**, orang lain mengubah tempat menjadi **ruang rapat lantai 3**. Karena paragrafnya berbeda, kedua perubahan muncul di tengah.

Tanpa konflik tersisa, Anda bisa langsung **Konfirmasi**, atau menyempurnakan teks tengah dahulu. Dokumen akhir di bawah adalah hasil nyata yang diterima callback konfirmasi.

<MergeDemo />

## Contoh yang hanya sebagian tergabung otomatis

Kali ini Anda mengubah waktu ke **11.00**, orang lain ke **14.00**. Perubahan berbeda pada paragraf sama menyisakan konflik waktu. Perubahan penanggung jawab menjadi **Jimin dan Seoyeon** serta tempat menjadi **ruang rapat lantai 3** diterapkan otomatis.

Selesaikan konflik dengan salah satu cara berikut:

- Kiri **&gt;&gt;**: ambil konten terkait dari versi awal.
- Kanan **&lt;&lt;**: ambil konten terkait dari versi baru tersimpan.
- **Selesaikan dengan isi saat ini**: pertahankan atau edit tengah, lalu tandai selesai.

Ubah kalimat waktu di tengah, lalu klik **Selesaikan dengan isi saat ini**. Konfirmasi hanya tersedia setelah semua konflik selesai.

<MergeDemo partial />

Mengedit kembali area terselesaikan mempertahankan statusnya. Mengurungkan penyelesaian juga membatalkan status; ulangi memulihkannya. Menghapus atau mengedit teks saja tidak otomatis menyelesaikan konflik terbuka.

## Aturan penggabungan otomatis dan konflik

Bandingkan perubahan dari dokumen awal ke dokumen Anda dan dari awal yang sama ke versi baru. Perubahan satu sisi dan perubahan identik di kedua sisi diterapkan otomatis. Perubahan paragraf atau baris terpisah juga digabung.

Seperti penggabungan teks Git, tumpang tindih dinilai per paragraf dan baris. Kata berbeda yang diubah pada baris sama tetap konflik. Sisipan berbeda di posisi sama atau edit konten yang dihapus sisi lain juga memerlukan keputusan.

Jika kedua sisi mengubah blok terstruktur seperti tabel, daftar, atau area float secara berbeda, seluruh struktur menjadi konflik. Sel dan item daftar tidak dicampur sembarang: pilih konten atau edit tengah. Pemindahan dan edit bertumpang tindih yang posisinya tidak pasti juga tidak diterapkan otomatis.

## Menghubungkan tampilan penggabungan mandiri

Berikan NABI TREE JSON tersimpan atau string HTML pada `base`, `local`, `incoming`. Gunakan wing dan opsi yang sama dengan editor asal. `mountMerge()` membuat editor tengah, toolbar, kedua sumber, pemilih konflik, dan tombol konfirmasi.

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'id',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` menerima JSON, HTML publikasi, revision pengeditan, dan `incomingVersion` hasil saat ini yang sudah selesai konfliknya. Mengembalikan `false` tidak menyelesaikan konfirmasi. Selama Promise menunggu, edit, pemilihan konflik, dan konfirmasi ganda diblokir. Melepas tampilan membatalkan `signal` hasil. Komposisi IME Korea harus selesai sebelum konfirmasi.

Hubungkan tindakan layanan seperti pemilih gambar atau unggahan sebagaimana editor biasa. `toolbarOptions` menerima panel dan tindakan host; `surfaceOptions` menerima opsi permukaan pengeditan.

`incomingVersion` mengembalikan nilai layanan tanpa perubahan. Layanan harus membandingkannya dengan versi terbaru server saat menyimpan. Jika versi lain tersimpan selama penggabungan, ambil dokumen terbaru dan mulai penggabungan baru, jangan menimpanya dengan hasil lama.

Status dan konfirmasi juga dapat diakses dari luar tampilan.

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

Baca hasil dengan `merge.nabi.getJson()` dan `merge.nabi.getHtml()`. Jangan simpan DOM editor atau `getEditorHtml()`. Untuk hanya menerapkan konten lama terpilih antara dua versi, gunakan penggabungan klik pada [Perbandingan](./compare).

## Konfirmasi setelah unggahan selesai

Hubungkan wing `upload` dan `mountUpload()` untuk tombol berkas, tempel, dan seret-lepas. `sendUpload` mengirim berkas ke server dan mengembalikan `{ uri }`. Lihat [Unggah berkas](../wing/etc/upload) untuk contoh lengkap koneksi dan progres.

Gunakan `merge.session.hold()` untuk menunda konfirmasi dan pemilihan konflik selama kerja asinkron seperti unggahan belum masuk dokumen. Panggil fungsi hasilnya saat selesai, batal, atau dilepas. Lepaskan **setelah disisipkan ke dokumen**, bukan langsung setelah diunggah ke server, agar berkas masuk hasil akhir.

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'id',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'id',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` adalah DOM pengeditan tengah; `merge.surface` dan `merge.toolbar` sudah terpasang. Jangan memasang permukaan atau toolbar lain di situ. Lepas mount unggahan dan progres tambahan dahulu, baru panggil `merge.unmount()`.
