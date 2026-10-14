---
title: Upload file
description: Hubungkan transfer file ke uploader layanan Anda.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Upload file

Hubungkan pemilihan file, drag and drop, dan operasi paste yang hanya berisi file ke alur upload. Demo di halaman ini tidak mengirim file ke server; pada layanan nyata, Anda harus menghubungkan uploader yang menerima file dan mengembalikan URL.

Untuk memasukkan hasil upload sebagai blok gambar, Anda memerlukan wing gambar. Untuk memasukkan file lain sebagai tautan lampiran, Anda memerlukan wing tautan. Jika layanan Anda menerima kedua format tersebut, pilih kedua wing secara eksplisit. Saat upload berlangsung, editor dikunci dan file yang berhasil disisipkan bersama sebagai satu langkah undo.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

Jika Anda hanya memilih `upload`, paket ini secara otomatis melengkapi salah satu dependensi gambar atau tautan yang belum ada. Transfer dihubungkan dengan `mountUpload()`, dan UI progres pada layar pengeditan biasanya dihubungkan dengan `mountUploadView()`. Jika server mengembalikan URL HTTPS, opsi URL lokal tidak diperlukan.

## Posisi penyisipan upload

Posisi saat pemilih file dibuka atau upload dimulai akan diingat. Jika hanya kursor yang dipindahkan, penyisipan tetap dilakukan di posisi awal. Jika upload dimulai dalam sel tabel, indikator progres dan isi akhirnya tetap di dalam sel itu. Hasil upload yang dimulai dalam area mengambang juga masuk ke area tersebut. Upload tidak dapat disisipkan pada pilihan yang melintasi beberapa sel.

Mengedit atau mengganti dokumen selama pemilihan file atau pemrosesan asinkron membatalkan penyisipan dan menampilkan pemberitahuan. Undo yang mengembalikan isi sama tidak memulihkan penyisipan di posisi lama. Jangan menilai penyelesaian hanya dari keberhasilan transfer: periksa `committed` dan `cancelled` yang diterima `onDone`. `committed` adalah jumlah file yang benar-benar disisipkan dalam dokumen.

## Kontrak API server

NABI NOTE tidak mengirim file ke server Anda dengan sendirinya. Fungsi `uploader` mengirim satu file ke server, lalu jika berhasil hanya mengembalikan URL `https:` publik atau yang diautentikasi. Kontrak API paling sederhana tampak seperti ini.

```text
POST /api/uploads
Content-Type: multipart/form-data
Field name: file

Success: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Failure: 4xx or 5xx response
```

Server tidak boleh hanya mempercayai nama file asli, ekstensi, atau nilai MIME yang dikirim browser. Periksa autentikasi dan izin terlebih dahulu, batasi ukuran file selama streaming, lalu periksa jenis file sebenarnya. Buat nama penyimpanan di server. Untuk gambar, lakukan re-encode atau buat thumbnail bila diperlukan. Jika file yang diupload tidak boleh dapat diunduh oleh semua orang, kembalikan jalur unduhan yang memerlukan autentikasi, bukan URL publik.

| Yang diperiksa di server | Alasan |
| --- | --- |
| Pengguna yang masuk dan izin upload | Mencegah penulisan ke penyimpanan pengguna lain |
| Ukuran per file dan ukuran total permintaan | Mencegah kehabisan memori dan penyimpanan |
| Jenis MIME dan ekstensi asli yang diizinkan | Memblokir file eksekusi dengan ekstensi yang diganti |
| Nama penyimpanan acak dan penyimpanan terisolasi | Mencegah manipulasi path dan penimpaan file yang ada |
| Akses URL respons dan kebijakan kedaluwarsa | Mencegah file privat terekspos hanya lewat URL |

`extensions` dan `maxFileSize` di sisi klien hanyalah langkah awal untuk memberi umpan balik cepat kepada pengguna. Terapkan batas yang sama di server juga.

## Menghubungkan uploader di browser

Contoh di bawah ini adalah integrasi nyata yang diharapkan NABI NOTE. Contoh memakai `XMLHttpRequest` karena `fetch()` standar browser tidak menyediakan progres upload. Kembalikan hanya `url` dari respons server; gambar menjadi blok gambar dan file lainnya menjadi tautan lampiran.

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountUpload,
  mountUploadView,
  wings,
  type UploadTask,
} from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const { nabi, registry } = createNabiWith(
  wings().use('img').use('a').use('upload').build(),
  { locale: 'id' },
)

function sendUpload(task: UploadTask): Promise<{ uri: string } | null> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', '/api/uploads')
    request.responseType = 'json'

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) task.onProgress((event.loaded / event.total) * 100)
    })

    request.addEventListener('load', () => {
      const url = request.response?.url
      if (request.status >= 200 && request.status < 300 && typeof url === 'string') {
        resolve({ uri: url })
      } else {
        resolve(null)
      }
    })
    request.addEventListener('error', () => reject(new Error('Upload request failed.')))
    task.signal.addEventListener('abort', () => request.abort(), { once: true })

    const body = new FormData()
    body.append('file', task.file as File, task.name)
    request.send(body)
  })
}

let uploadView: ReturnType<typeof mountUploadView>
const upload = mountUpload({
  nabi,
  root: content,
  uploader: sendUpload,
  extensions: ['png', 'jpg', 'jpeg', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  maxTotalSize: 20 * 1024 * 1024,
  locale: 'id',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'id' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'id',
})

const toolbar = mountToolbar({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  surface: content,
  onFiles: upload.take,
  locale: 'id',
})
```

Hubungkan `fileSink: upload.take` agar seret dan lepas serta tempel yang hanya berisi file masuk ke alur upload. Hubungkan tombol pemilihan file melalui `onFiles: upload.take` pada toolbar. Selama upload, editor terkunci dan file yang berhasil disisipkan dalam satu langkah undo per batch. `upload.cancel()` atau tombol batal di `uploadView` menghentikan permintaan yang berjalan melalui `AbortSignal`.

## Kegagalan dan pembersihan

Jika server mengembalikan respons error atau `uploader` mengembalikan `null`, file tersebut tidak disisipkan ke dokumen. File lain dalam batch yang sama tetap diproses. Jika batas ukuran total terlampaui, seluruh batch tidak dimulai. Saat menutup layar, unmount dalam urutan kebalikan dari pembuatan.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

Hanya selama pengembangan, Anda dapat menggunakan URL `blob:` untuk pratinjau langsung. Dalam hal ini, aktifkan `allowLocalUrls: true` pada perakitan editor, wing gambar, dan wing upload. Jika upload server sungguhan mengembalikan URL HTTPS, lebih aman untuk tidak mengaktifkan opsi ini.

## Gaya CSS

File biasa yang selesai diupload ditampilkan oleh wing tautan sebagai `a[data-nabi-file]`. Gunakan selector ini jika Anda hanya ingin mengubah tampilan lampiran pada tampilan terbitan.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

Hasil upload gambar mengikuti CSS wing gambar. Progres upload hanya muncul di tampilan pengeditan, jadi tampilan terbitan tidak perlu membuat status progres.
