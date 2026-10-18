---
title: Perbandingan
description: Bandingkan dua dokumen berdampingan dan terapkan konten lama yang dipilih ke dokumen saat ini.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# Perbandingan

Bandingkan dua dokumen tersimpan untuk melihat perubahan. Tampilan dapat dibuka tanpa editor; sambungkan callback untuk menerapkan konten lama yang dipilih ke dokumen saat ini.

## Menerapkan konten lama yang dipilih

Kiri adalah dokumen lama, kanan dokumen saat ini. Klik **&gt;&gt;** di samping perubahan untuk menerapkan konten lama paragraf atau kelompok baris tersebut. Pemilihan bukan per karakter. Konten yang dihapus dapat dipulihkan, dan konten baru dapat dibuang.

Coba pulihkan hanya waktu pertemuan atau barang bawaan. Buka **Dokumen saat ini yang diperbarui callback** untuk melihat hasil. **Mulai ulang** mengembalikan contoh awal.

<CompareDemo />

## Perbandingan mandiri

Impor dari `nabi-note/diff`. Berikan NABI TREE JSON tersimpan atau string HTML sebagai `before` dan `after`. Susun registry dengan wing yang sama seperti editor pembuat dokumen agar tabel, daftar, gambar, dan konten lain terbaca dan ditampilkan utuh.

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'id',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

Secara default hanya perubahan beserta konteksnya yang terlihat. Tombol lipat membuka dokumen lengkap; sebelumnya/berikutnya menelusuri perubahan. Tanpa perubahan, seluruh dokumen tampil. Tanpa `onMerge`, perbandingan hanya baca.

## Menghubungkan penggabungan klik melalui callback

Klik mengirim usulan hasil ke `onMerge`. Menyambungkan callback tidak otomatis menyimpan dokumen. Layanan harus menerima usulan dan memanggil `update()` untuk mengubah hasil perbandingan.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'id',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` adalah NABI TREE JSON yang hanya menerapkan perubahan terpilih. `before` dan `after` adalah dokumen saat diklik; `changeId` mengidentifikasi perubahan, `revision` keadaan perbandingan. Berikan `revision` ini sebagai argumen ketiga `update()`: jika perbandingan sudah berubah, hasilnya `false` tanpa menerapkan usulan.

Klik ganda diblokir selama callback asinkron ditunggu. Memperbarui dengan dokumen lain atau melepas tampilan membatalkan `signal`. Saat menyimpan ke server, periksa sinyal dan versi dokumen server agar hasil lama tidak menimpa dokumen baru.

## Membuka perbandingan dari editor

Sambungkan wing `diff` dan `mountDiffWing()` untuk membuka perbandingan dari toolbar. Acuannya dokumen terakhir yang dimuat. Pengeditan biasa dan urungkan tidak mengubah acuan.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'id',
  merge: true,
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

Dengan `merge: true`, konten lama terpilih diterapkan ke editor. Tindakan dapat diurungkan dan acuan tetap. Perubahan editor asal selama tampilan terbuka menghitung ulang perbandingan. Tanpa `merge`, tampilan tetap hanya baca.

Panggil `toolbar.unmount()` dan `comparison.unmount()` saat melepas tampilan. Untuk menyertakan versi awal pengeditan dan otomatis menggabungkan kedua sisi, gunakan [Penggabungan](./merge).
