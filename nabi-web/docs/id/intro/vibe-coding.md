---
title: Vibe Coding AI
description: llms.txt
---

# Vibe Coding AI

**`llms.txt`** adalah spesifikasi yang dipakai situs web untuk menyerahkan isinya kepada agen
AI (LLM). Bukan HTML, ia menata struktur dan cara pakai proyek dalam markdown yang bisa
langsung dibaca agen. Spesifikasi lengkapnya ada di [llmstxt.org](https://llmstxt.org/).

Situs ini juga membuka pintu itu. Tidak perlu menghafal alamatnya — seperti contoh di bawah,
**cukup berikan alamatnya ke agen** dan sisanya diikuti sendiri.

```
https://nabi.saro.me/llms.txt
```

Cursor, Claude Code, OpenAI Codex, Windsurf, dan lainnya sudah mendukung standar llms.txt.

## Saat memasang untuk pertama kali

Saat membawa nabi-note ke situs yang belum memakainya, katakan sekaligus ke agen apa yang
ingin dinyalakan, apakah ada mode terang/gelap, dan lewat cara apa Anda memasangnya — sisanya
dirakit sendiri oleh agen. **Hanya kalimat terakhir yang berbeda di antara tiga kasus di
bawah** — sisanya bisa dibiarkan sama.

### npm + rendering di server (SSR) — digambar di server (Node) setiap permintaan

Ini berlaku baik untuk backend Node yang Anda jalankan sendiri maupun framework SSR seperti
Next.js, Nuxt, atau SvelteKit — keduanya sama-sama menggambar dokumen di Node dan
mengirimkannya setiap permintaan.

```
Kami mau memasang nabi-note sebagai editor baru di situs kami. Pakai
https://nabi.saro.me/llms.txt sebagai panduan. Situs kami punya mode
terang/gelap, jadi samakan editornya. Nyalakan semua wing yang sudah
disediakan secara default.

Kami merender di server dengan Nuxt, dan kami mau teksnya sudah terlihat
begitu orang membuka halaman — digambar lebih dulu di server. Pasang
lewat npm dan sambungkan dengan SSR plus hydrate.
```

### npm + rakit hanya di browser (CSR) — ada bundler, tapi tidak perlu rendering di server

```
Kami mau memasang nabi-note sebagai editor baru di situs kami. Pakai
https://nabi.saro.me/llms.txt sebagai panduan. Situs kami punya mode
terang/gelap, jadi samakan editornya. Nyalakan semua wing yang sudah
disediakan secara default.

Ini frontend yang dibangun dengan Vite, dan kami tidak perlu rendering
di server. Pasang lewat npm dan rakit semuanya hanya di browser.
```

### CDN — halaman statis tanpa build tool

```
Kami mau memasang nabi-note sebagai editor baru di situs kami. Pakai
https://nabi.saro.me/llms.txt sebagai panduan. Situs kami punya mode
terang/gelap, jadi samakan editornya. Nyalakan semua wing yang sudah
disediakan secara default.

Halaman ini HTML statis tanpa build tool. Sambungkan dengan tag
`<script>`.
```

::: tip Terang dan gelap tidak perlu instruksi tambahan
`nabi.css` sudah membawa nilai terang bawaan, penimpaan `.dark`, dan penimpaan `.light` yang
eksplisit. Biarkan saja kelas `dark`/`light` halaman seperti apa adanya — editor akan
mengikutinya sendiri. Untuk mengganti warna brand, minta agen membaca `llms/styling.md` juga.
:::

Ketiga contoh hanya berbeda di kalimat terakhir itu — agen mencari dan membaca `llms/ssr.md`
(plus `llms/quickstart-npm.md`), `llms/quickstart-npm.md`, dan `llms/quickstart-cdn.md` secara
berurutan, lalu menyambungkannya sesuai itu.

## Saat mengubah, menambah, atau menghapus fitur

Kalau nabi-note sudah terpasang, mengubah atau menambah sesuatu lebih aman diminta sebagai
**riset dan rencana dulu, bukan langsung implementasi** — terutama untuk apa pun yang
menjangkau backend, di mana Anda perlu tahu apa yang harus disiapkan sebelum menulis kode
apa pun.

### Contoh — riset dan rencana dulu

```
Saya mau menambah unggah berkas. Baca https://nabi.saro.me/llms/wings.md dan
https://nabi.saro.me/llms/api-reference.md, dan cari tahu apa yang
dibutuhkan backend kami untuk mendukung wing upload (alamat yang
menerima berkas, ekstensi dan batas ukuran yang diizinkan, seperti apa
respons kalau gagal). Jangan diimplementasikan dulu — tunjukkan saja
rencana apa yang perlu disiapkan.
```

Agen akan menemukan di `llms/wings.md` bahwa `upload` adalah wing alat (tool) yang menerima
`Uploader`, memastikan signature sebenarnya dari `mountUpload`, `Uploader`, dan
`allowLocalUrls` di `llms/api-reference.md`, lalu menyusun rencana yang memisahkan apa yang
harus dibuka backend dari apa yang diputuskan sendiri oleh frontend. Setelah rencananya Anda
tinjau dan setujui, minta agen melanjutkan implementasinya.

### Contoh yang lebih sederhana — bisa langsung diminta

Perubahan kecil yang tidak perlu rencana bisa diminta langsung.

```
Baca https://nabi.saro.me/llms/styling.md dan ubah hanya warna aksen dan
latar tema gelap ke warna brand kami.
```

::: tip Wing yang melanggar kontrak ditolak tepat saat didaftarkan
Saat meminta agen membuat wing baru, minta juga ia membaca
[`llms/custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md). Kesalahan umum — memakai
kata terlarang sebagai nama, atau wing yang membuat node tapi tanpa `toHtml` — tidak gagal
belakangan; semuanya **ditolak tepat saat wing didaftarkan.** Bagian "Kontrak yang dilanggar
ditolak saat registrasi, bukan belakangan" di dokumen itu mendaftar apa saja yang diperiksa.
:::

::: tip Setelah terpasang, tinggalkan satu baris saja
Setelah pemasangan pertama, tidak perlu mengulang alamatnya setiap kali. Tambahkan satu baris
seperti ini ke berkas aturan proyek Anda (`CLAUDE.md`, `.cursorrules`, dsb.), dan permintaan
singkat seperti "lakukan X dengan nabi-note" saja sudah cukup bagi agen untuk menemukan
alamatnya sendiri.

```md
Proyek ini memakai `nabi-note` sebagai editornya. Periksa
https://nabi.saro.me/llms.txt dulu sebelum mengerjakan apa pun yang
terkait dengannya.
```
:::

## Berikutnya

- [{{ t('menu_intro_index') }}](../intro) — kata-kata yang dipakai dokumen ini
- [{{ t('menu_wing_custom') }}](../wing/custom) — membuat sendiri format yang belum ada, sebagai
  dokumen yang bisa dibaca manusia

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
