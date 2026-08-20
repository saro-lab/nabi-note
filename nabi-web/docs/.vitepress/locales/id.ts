// Translated — the values now speak Indonesian; only the frame and the keys are shared with English.
// A missing key is a type error, so the file stays whole.
// 옮겼다 — 값은 이제 인도네시아어로 선다. 영어와 같은 것은 틀과 키뿐이다.
// 키가 하나라도 빠지면 타입 오류라 파일은 온전해야 한다.
export const id = {
  label: 'Indonesia',
  lang: 'id',
  link: '/id/',
  description: 'NABI NOTE — editor WYSIWYG sumber terbuka.',

  menu_docs: 'Dokumentasi',
  menu_intro: 'Pengantar',
  menu_intro_index: 'Apa itu NABI NOTE?',
  menu_intro_usage: 'Cara pakai dasar',
  menu_intro_ssr: 'Dukungan SSR',
  menu_intro_cdn: 'Lewat CDN',
  menu_intro_vibe_coding: 'Vibe Coding AI',

  menu_wing: 'Sayap (Wing)',
  menu_wing_custom: 'Membuat sayap sendiri',
  menu_custom_start: 'Memulai',
  menu_custom_inline: 'Tanda inline',
  menu_custom_block: 'Blok dan atributnya',
  menu_custom_ui: 'UI dan aksi',
  menu_custom_input: 'Tombol, aturan otomatis, tempel',

  menu_style: 'Tampilan',
  menu_style_custom: 'Gaya sendiri',

  menu_projects: 'Proyek',

  menu_inline: 'Inline',
  menu_inline_bold: 'Tebal',
  menu_inline_italic: 'Miring',
  menu_inline_underline: 'Garis bawah',
  menu_inline_strikethrough: 'Coret',
  menu_inline_superscript: 'Superskrip',
  menu_inline_subscript: 'Subskrip',
  menu_inline_link: 'Tautan',
  menu_inline_highlight: 'Stabilo',
  menu_inline_text_color: 'Warna teks',

  menu_block: 'Blok',
  menu_block_heading: 'Judul',
  menu_block_bullet_list: 'Daftar berpoin',
  menu_block_ordered_list: 'Daftar bernomor',
  menu_block_task_list: 'Daftar tugas',
  menu_block_table: 'Tabel',
  menu_block_image: 'Gambar',
  menu_block_youtube: 'YouTube',
  menu_block_code: 'Kode',
  menu_block_details: 'Blok lipat',
  menu_block_quote: 'Kutipan',
  menu_block_divider: 'Pembatas',

  menu_etc: 'Lainnya',
  menu_etc_align: 'Perataan',
  menu_etc_dropcap: 'Drop cap',
  menu_etc_typeface: 'Jenis huruf',
  menu_etc_font_size: 'Ukuran huruf',
  menu_etc_clear_format: 'Hapus format',
  menu_etc_upload: 'Unggah berkas',

  search: 'Cari',
  search_no_results: 'Tidak ada hasil',
  search_hint: 'Masukkan kata pencarian',
  search_move: 'Pindah',
  search_open: 'Buka',
  search_close: 'Tutup',

  demo_placeholder: 'Tulis sesuatu di sini',
  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c">Saat ini dokumentasi sedang dibuat dan diterjemahkan dengan AI.</p><p data-nabi-align="c">Setelah mapan, akan menjadi versi 1.0.0.</p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">Penyunting WYSIWYG sumber terbuka</span></i></span></p><p><br/></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> adalah penyunting WYSIWYG sumber terbuka yang setiap fungsi utamanya — format, perataan, tabel, unggahan, dan selebihnya — dipisahkan dari inti sebagai modul mandiri bernama «sayap», sehingga pengembang bisa memperluasnya tanpa batas. Ditulis dengan Vanilla JS murni dan menargetkan <b>NOL ketergantungan kerangka kerja</b>, jadi ia masuk begitu saja ke React, Vue, atau apa pun, dan tersedia <b>pustaka CDN</b> untuk proyek tanpa sistem build. Ia membawa format JSON-nya sendiri, <b>NABI TREE</b>, sehingga alih rupa antara HTML dan teks bisa disiapkan di tempat yang tak punya DOM (Node.js, SSR); dan karena dokumen disusun ulang dari kosakata yang diizinkan alih-alih ditambal, <b>skrip XSS tertutup dari akarnya</b> tanpa pustaka pembersih terpisah. Dari sisi rupa, ia memakai sistem <b>CSS Variable</b> sehingga warna merek mudah diganti, dan <b>tata letak berbasis rem</b> sehingga memperbesar atau memperkecil tetap membuat antarmuka ponsel mulus; warna yang selaras untuk terang dan gelap, stabilo, serta fon multibahasa sudah tersedia. Ditambah lagi <b>pengurutan kolom tabel yang mengenali tipe</b>, <b>riwayat lokal</b> di atas IndexedDB, dan dukungan untuk <b>vibe coding</b>.</span></p><p><br/></p><h2>Jenis huruf</h2><p>Tanpa kait (bawaan), berkait, lebar tetap, dan tulisan tangan — setiap keluarga menumpuk fon menurut sistem aksara, jadi bahasa apa pun tetap memakai wajah keluarga itu; aksara yang tak punya wajah tulisan tangan di keluarga itu jatuh ke fon bawaan peramban. <b>Fon bawaan ditentukan oleh induknya.</b></p><p><br/></p><p>Di bawah ini setiap keluarga ditunjukkan <b>dalam berbagai bahasa</b>.</p><p><br/></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">세리프 · Serif · 明朝体 · 衬线 · Serif · Avec empattement · Serif · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif</span></span></p><p><br/></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">고정폭 · Monospace · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap</span></span></p><p><br/></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">필기체 · Cursive · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Cursiva · Рукописный · خط اليد · घसीट · হস্তলিপি · رواں خط · Tulisan tangan</span></span></p><p><br/></p><p><br/></p><h2>Ukuran huruf</h2><p><span data-nabi-size="xs">Sangat kecil</span></p><p><span data-nabi-size="sm">Kecil</span></p><p><span data-nabi-size="lg">Besar</span></p><p><span data-nabi-size="xl">Sangat besar</span></p><p><br/></p><p><br/></p><h2>Judul</h2><p>Di baris kosong ketik # lalu tekan spasi — seketika menjadi judul.</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p><br/></p><p><br/></p><h2>Tebal · Miring · Garis bawah · Coret</h2><p><b>Tebal</b> <i>miring</i> <u>garis bawah</u> <s>coret</s> — contohnya begini.</p><p><b><i><s><u>Bisa juga ditumpuk.</u></s></i></b></p><h3>Superskrip dan subskrip</h3><p>Luasnya 3,5 m<sup>2</sup>, dan catatan kaki ditulis seperti ini<sup>1</sup>.</p><p>Air itu H<sub>2</sub>O.</p><p><br/></p><p><br/></p><h2>Warna teks · Stabilo</h2><p>Paletnya dipilih agar tetap terbaca baik di mode terang maupun gelap.</p><p>Warna teks <span data-color="green">Hijau</span> · <span data-color="coral">Koral</span> · <span data-color="violet">Ungu</span> · <span data-color="amber">Ambar</span> · <span data-color="blue">Biru</span></p><p>Stabilo <mark data-color="yellow">Kuning</mark> · <mark data-color="green">Hijau</mark> · <mark data-color="cyan">Sian</mark> · <mark data-color="pink">Merah muda</mark> · <mark data-color="purple">Ungu</mark> · <mark data-color="orange">Jingga</mark></p><p><br/></p><p><br/></p><h2>Tautan</h2><p>Masukkan alamat, maka jadilah <a href="https://nabi.saro.me/">tautan</a>.</p><p>Hanya http:// dan https:// yang diterima; hal seperti javascript: tak akan lolos.</p><p>Misalnya ketik <a href="https://nabi.saro.me/">https://nabi.saro.me</a> lalu tekan spasi atau Enter — ia berubah sendiri, seperti terlihat di sini.</p><h3>target</h3><p>Secara bawaan tautan seasal terbuka di jendela ini, situs lain di jendela baru; aturan ini bisa ditetapkan saat penyunting dideklarasikan.</p><h3>Tautan lampiran</h3><p>Kalau yang diunggah bukan gambar, tersisa tautan berbentuk berkas seperti di bawah.</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>Lampiran</a> begitulah bentuk yang tersisa.</p><p><br/></p><p><br/></p><h2>Perataan</h2><p>Rata kiri</p><p>Rata tengah</p><p>Rata kanan</p><h3>Judul pun bisa diratakan.</h3><p><br/></p><p><br/></p><h2>Daftar</h2><h3>Daftar berbutir</h3><p>Di baris kosong ketik - lalu tekan <b>spasi</b> — seketika menjadi daftar berbutir.</p><div data-nabi-p><ul><li><p>Ini sebuah butir</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab untuk menjorokkan dan mengembalikan.</p></li></ul></div></li></ul></div><h3>Daftar bernomor</h3><p>Di baris kosong ketik 1. lalu tekan <b>spasi</b> — jadilah daftar bernomor.</p><div data-nabi-p><ol><li><p>Pertama</p></li><li><p>Kedua</p></li><li><p>Ketiga</p></li></ol></div><h3>Daftar centang</h3><p>Di baris kosong ketik [ ] atau [x] lalu tekan <b>spasi</b> — jadilah daftar centang.</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>Yang ini sudah dikerjakan.</p></li><li data-nabi-checked="false"><p>Yang ini belum.</p></li></ul></div><p><br/></p><p><br/></p><h2>Tabel</h2><p>Buat lewat tabel di bilah alat; baris dan kolom bisa ditambah, dihapus, dan digabung.</p><h3>Pengurutan kolom</h3><p>Tekan <b>Pratinjau</b>, lalu klik kepala kolom <b>Stok</b> dan <b>Harga</b> satu per satu.</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Model</p></th><th><p>Stok</p></th><th><p>Harga</p></th><th><p>Berat</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>Belum ditentukan</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>Harga</b> seluruhnya angka, jadi diurutkan sebagai angka.</p><p><b>Stok</b> diurutkan sebagai teks karena sel terakhirnya berisi huruf. (Kalau ingin menghindarinya, kosongkan sel itu.)</p><p><br/></p><p><br/></p><h2>Garis pemisah</h2><p>Ketik --- lalu tekan Enter — berubah menjadi garis pemisah.</p><div data-nabi-p><hr/></div><p><br/></p><p><br/></p><h2>Gambar</h2><p>Masukkan alamat gambar atau unggah satu; lebarnya bisa diatur dari 30% sampai 100%, dan bisa diletakkan di kiri, tengah, atau kanan.</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p><br/></p><p><br/></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p><br/></p><p><br/></p><h2>Unggah</h2><p>Cobalah seret gambar atau berkas ke atas penyunting.</p><p>Unggahan pada demo ini hanya tiruan; lewat pengaturan ia tersambung ke peladen Anda.</p><p>Kalau unggahan gagal, gambar atau berkas itu dikeluarkan dari penyunting.</p><p><br/></p><p><br/></p><h2>Kutipan</h2><div data-nabi-p><blockquote><p>Di baris kosong ketik &gt; lalu tekan <b>spasi</b> — jadilah kotak kutipan.</p><p>Ia boleh menempati beberapa baris.</p></blockquote></div><p><br/></p><p><br/></p><h2>Kode</h2><p>Di baris kosong ketik \`\`\` lalu tekan <b>spasi atau Enter</b> — jadilah kotak kode.</p><p>Tulis sekalian bahasanya, seperti \`\`\`java, lalu spasi atau Enter — kotaknya memakai bahasa itu.</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p><br/></p><p><br/></p><h2>Lipatan</h2><div data-nabi-p><details open><summary>Lipatan terdiri dari judul dan isi.</summary><p>Anda bisa menentukan apakah ia disimpan dalam keadaan tertutup atau terbuka.</p></details></div><p><br/></p><h2>Riwayat lokal</h2><p>Lewat IndexedDB <b>peramban</b>, riwayat disimpan pada selang waktu yang Anda tentukan.</p><p>Ia hanya tinggal di perangkat ini dan menyimpan sebanyak yang dideklarasikan. — bawaannya tiap 30 detik, 20 sesi terakhir.</p><p><br/></p><p><br/></p><h2>Pintasan</h2><p>Tekan <b>Shift dua kali cepat</b>, maka bilah alat menampilkan pintasan tiap fungsi.</p><p><br/></p><p><br/></p><h2>Format otomatis</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Contoh</p></th><th><p>Tombol</p></th><th><p>Hasil</p></th></tr><tr><td><p>#</p></td><td><p>Spasi</p></td><td><p>Judul</p></td></tr><tr><td><p>-</p></td><td><p>Spasi</p></td><td><p>Daftar berbutir</p></td></tr><tr><td><p>1.</p></td><td><p>Spasi</p></td><td><p>Daftar bernomor</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>Spasi</p></td><td><p>Daftar centang</p></td></tr><tr><td><p>&gt;</p></td><td><p>Spasi</p></td><td><p>Kutipan</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>Spasi · Enter</p></td><td><p>Kotak kode</p></td></tr><tr><td><p>---</p></td><td><p>Enter</p></td><td><p>Garis pemisah</p></td></tr><tr><td><p>https://…</p></td><td><p>Spasi · Enter</p></td><td><p>Tautan</p></td></tr></table></div></div><p><br/></p><p><br/></p><h3>Fungsi keluaran</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Fungsi</p></th><th><p>Hasil</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p><br/></p><p><br/></p><h2>Berjalan tanpa DOM</h2><p>Mengubah JSON menjadi HTML <b>tidak memerlukan DOM</b>.</p><p>Peladen (Node.js) membaca pohon nabi yang tersimpan apa adanya dan menyusun HTML sambil menahan XSS.</p><p><br/></p><h2>Ramah ponsel</h2><div data-nabi-p><ul><li><p><b>Antarmuka ponsel</b> — tata letak responsif menopang antarmuka ponsel.</p></li><li><p><b>Koreksi papan ketik</b> — saat papan ketik muncul, tingginya dikoreksi.</p></li><li><p><b>Ukuran lentur</b> — semua ukuran ditulis dalam rem.</p></li><li><p><b>Multibahasa</b> — ia berbicara dalam empat belas bahasa.</p></li></ul></div><p><br/></p><h2>Penyesuaian</h2><div data-nabi-p><ul><li><p><b>Sayap buatan sendiri</b> — kalau ada fungsi yang kurang, buat sendiri lalu daftarkan.</p></li><li><p><b>CSS buatan sendiri</b> — warna, sudut, dan jarak semuanya didefinisikan dengan --nabi-*, gelap maupun terang terserah Anda.</p></li><li><p><b>Sumber terbuka</b> — terbuka di GitHub.</p></li></ul></div><div data-nabi-p><hr/></div><p>Lihat dokumentasi → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
  demo_wings: 'Sayap',
  demo_wings_all: 'Nyalakan semua',
  demo_wings_none: 'Matikan semua',
  demo_zoom: 'Perbesaran',
  demo_zoom_out: 'Perkecil',
  demo_zoom_in: 'Perbesar',
  demo_zoom_reset: 'Atur ulang',
  demo_sticky: 'Bilah alat menempel',
  demo_sticky_keyboard: 'Kompensasi papan ketik seluler',
  demo_sticky_height: 'Jarak',
  demo_sticky_unit: 'Satuan jarak',
  demo_typeface_base: 'Jenis huruf bawaan',
  demo_typeface_sans: 'Tanpa serif',
  demo_typeface_serif: 'Berserif',
  demo_typeface_mono: 'Lebar tetap',
  demo_typeface_cursive: 'Tulisan tangan',
  demo_html_small: '<p>Tulis di sini, dan nyalakan-matikan sayap di atas.</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>Tunjuk <b>kata-kata yang penting</b>. Pilih sebagian teks lalu tekan <b>B</b> di bilah alat.</p>',
  demo_html_italic:
    '<p>Kutipan dan kata asing ditulis <i>miring</i>. Pilih kalimat ini dan coba sendiri.</p>',
  demo_html_underline:
    '<p>Ada <u>garis bawah</u> di sini. Pilih huruf-huruf itu dan tekan lagi untuk melepasnya.</p>',
  demo_html_strikethrough: '<p><s>Rp190.000</s> Rp99.000 — nilai lama tetap terlihat.</p>',
  demo_html_superscript:
    '<p>Luasnya 3,5 m<sup>2</sup>, dan catatan kaki digantung begini.<sup>1</sup></p>',
  demo_html_subscript: '<p>Air adalah H<sub>2</sub>O dan gelembungnya CO<sub>2</sub>.</p>',
  demo_html_link:
    '<p>Beri alamat dan jadilah <a href="https://example.com">tautan seperti ini</a>. Tautan yang sudah ada tidak memunculkan baris konteks — untuk mengubah alamatnya, hapus lalu buat yang baru.</p>',
  demo_html_highlight:
    '<p>Pilih sebagian teks lalu tekan tombolnya: enam warna — <mark data-color="yellow">kuning</mark>, <mark data-color="green">hijau</mark>, <mark data-color="cyan">sian</mark> — muncul di sebelah kursor.</p><p>Taruh kursor di dalam markah dan contoh warna yang sama muncul di baris konteks untuk mengganti warnanya.</p>',
  demo_html_text_color:
    '<p>Warnai teks <span data-color="green">hijau</span>, <span data-color="coral">koral</span>, atau <span data-color="violet">ungu</span> — lima warna semuanya.</p><p><mark data-color="yellow">Menumpuk dengan stabilo</mark> tidak masalah: keduanya markah berbeda, jadi <span data-color="blue">berlaku bersamaan.</span></p>',
  demo_html_heading:
    '<h1>Judul 1</h1><h2>Judul 2</h2><h3>Judul 3</h3><p>Ini teks isi. Mengetik # dan spasi di baris kosong juga membuat judul.</p>',
  demo_html_bullet_list:
    '<ul><li>Daftar berpoin</li><li>Tab menjorokkan, Shift+Tab mengembalikan<ul><li>Butir bersarang</li></ul></li></ul><p>Mengetik - dan spasi di baris kosong juga membuatnya.</p>',
  demo_html_ordered_list:
    '<ol><li>Daftar bernomor</li><li>Sisipkan atau hapus butir, nomornya menyesuaikan sendiri</li></ol><p>Mengetik 1. dan spasi di baris kosong juga membuatnya.</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">Klik kotak di depan teks</li><li data-nabi-checked="false">Status centangnya tersimpan bersama dokumen</li></ul><p>Mengetik [ ] atau [x] di baris kosong juga membuatnya.</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>Tombol</th><th>Fungsinya</th></tr><tr><td>Tab</td><td>Ke sel berikutnya</td></tr><tr><td>Panah</td><td>Bergerak sesuai kisi</td></tr></tbody></table><p>Taruh kursor di sebuah sel dan baris konteks terisi perintah baris dan kolom.</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="Logo NABI NOTE" data-nabi-width="50"></div><p>Klik gambarnya untuk kotak lebar dan perataan.</p>',
  demo_html_youtube:
    '<p>Pakai tombol YouTube di bilah alat, atau tempel saja alamat videonya — sematannya muncul persis di sini.</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>Taruh kursor di dalam kode dan baris konteks menampilkan kolom bahasa.</p>',
  demo_html_details:
    '<details open=""><summary>Klik di sini untuk melipat</summary><p>Status lipatannya tersimpan bersama dokumen — pembaca melihatnya persis seperti yang ditinggalkan penulis.</p></details>',
  demo_html_quote:
    '<blockquote><p>Kotak untuk kata-kata yang bukan milik Anda. Di dalamnya hanya markah karakter yang berlaku — tombol gambar, kode, dan tabel tidak muncul.</p></blockquote><p>Ketik &gt; dan spasi di baris kosong, baris itu menjadi kutipan.</p>',
  demo_html_divider:
    '<p>Paragraf di atas pembatas.</p><hr><p>Dan satu di bawahnya. Mengetik --- saja di satu baris lalu menekan Enter juga membuat garis.</p>',
  demo_html_align:
    '<p data-nabi-align="l">Rata kiri</p><p data-nabi-align="c">Rata tengah</p><p data-nabi-align="r">Rata kanan</p>',
  demo_html_font_size:
    '<p data-nabi-size="xs">Sangat kecil — untuk catatan kaki dan sisipan.</p><p data-nabi-size="sm">Kecil — selangkah di belakang teks isi.</p><p>Paragraf ukuran bawaan. Tekan tombolnya dan lima tingkat muncul, <b>masing-masing dalam bahasa Anda, dengan ukurannya sendiri</b>.</p><p data-nabi-size="lg">Besar — kalimat yang berbobot.</p><p data-nabi-size="xl">Sangat besar — lead di bawah judul.</p>',
  demo_html_typeface:
    '<p>Paragraf ini tidak memakai jenis huruf apa pun — tampil dengan bawaan halaman, tanpa serif.</p><p data-nabi-typeface="serif">Paragraf ini berserif. Anda memilih keluarganya; fon sungguhnya tergantung apa yang dipasang situs ini ke token, di sini Noto Serif.</p><p data-nabi-typeface="mono">Paragraf ini berlebar tetap. Tiap karakter mengambil lebar yang sama, sehingga kolom sejajar — 0O 1lI</p><p data-nabi-typeface="cursive">Paragraf ini bergaya tulisan tangan — Handwriting · 手書き · 手写.</p><p>Jenis huruf diatur <b>per paragraf</b>, dan berdampingan dengan baik bersama markah seperti tebal.</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">Huruf pertama membentang tiga baris dan teksnya mengalir di sampingnya. Paragraf pendek pun tetap menyediakan ruang untuk baris-baris itu, jadi blok di bawahnya tidak pernah terdesak.</p><p>Paragraf ini tidak memakainya.</p>',
  demo_html_clear_format:
    '<p>Pilih teks yang <b>tebal</b>, <i>miring</i>, <u>bergaris bawah</u>, atau <s>tercoret</s> lalu tekan penghapusnya.</p><p>Hanya format karakter yang hilang — bloknya tetap persis seperti semula.</p>',
  demo_html_upload:
    '<p>Seret berkas ke kotak ini, atau tempelkan. Situs ini tidak punya peladen untuk diunggah, jadi ia hanya berpura-pura — hasilnya hanya ada di halaman ini saja.</p><p>Lampiran yang selesai terlihat seperti <a href="/nabi-note.svg" data-nabi-file="svg">nabi-note.svg</a>.</p>',


  cdn_demo_lead: 'Simpan kode di bawah sebagai {file} lalu buka di browser — hasilnya langsung terlihat.',
  cdn_demo_download: 'Unduh demo.html',
  cdn_code_minheight: 'Tinggi minimum editor — supaya saat pertama dibuka tidak terlihat seperti kotak satu baris. Ubah nilainya sesuka Anda.',
  cdn_code_wings: 'Semua wing kecuali upload.',
  cdn_code_faces:
    'Dari tipografi, hanya sans dan serif yang disisakan.\nSetiap sistem mendukung tipografi yang berbeda, jadi mono dan cursive perlu diimpor\nterpisah sebagai web font agar dikenali di semua platform. Rinciannya ada di halaman "Tipografi".',
  cdn_code_change: 'Contoh callback saat nilai berubah',
  code_copy: 'Salin kode',
  demo_install: 'Pasang',
  demo_code: 'Kode',
  demo_chars: '{n} karakter',
  demo_tree: 'nabi-tree',
  demo_loading: 'Memuat editor…',

  page_not_found: 'Halaman tidak ditemukan',
  nav_prev: 'Sebelumnya',
  nav_next: 'Berikutnya',
}
