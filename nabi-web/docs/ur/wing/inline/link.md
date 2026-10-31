---
title: لنک
description: محفوظ ویب پتے جوڑیں اور اپ لوڈ شدہ attachments دکھائیں۔
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# لنک

Pilih teks lalu lampirkan alamat padanya. Jika Anda memasukkan alamat tanpa memilih teks, alamat itu sendiri dimasukkan sebagai teks tautan. Mengetik alamat `http://` atau `https://` lalu menekan Space atau Enter juga mengubahnya menjadi tautan.

Tautan hanya menyimpan `http:`, `https:`, dan path situs yang sama yang diawali `.` atau `/`. Alamat yang asalnya tidak dapat dikenali jelas, seperti `javascript:` atau `//example.com`, ditolak. Tautan lampiran yang dibuat oleh upload juga menyimpan informasi file dan tidak dapat dibuat manual seperti tautan biasa.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## URL پیسٹ کرنا

اگر شروع اور آخر کے خالی حروف ہٹانے کے بعد پیسٹ کیا گیا پورا مواد ایک درست `http://` یا `https://` URL ہو، تو اسے فوراً لنک کے طور پر شامل کیا جاتا ہے۔ جملوں کے اندر موجود URL، کئی URL والا متن اور نسبتی پاتھ موجودہ پیسٹ طریقے کے مطابق سنبھالے جاتے ہیں۔ کوڈ بلاکس اور لنک wing کے بغیر ایڈیٹر میں مواد متن ہی رہتا ہے۔ اصل فارمیٹنگ برقرار رکھنے کے لیے ایڈیٹر سے کاپی کیے گئے درست اندرونی کلپ بورڈ ڈیٹا کو ترجیح دی جاتی ہے۔

لنک کا دکھائی دینے والا متن مقرر کرنے کے لیے `mountSurface()` میں `onPasteUrl` کال بیک استعمال کریں۔

| آرگیومنٹ | قدر |
| --- | --- |
| `url` | شروع اور آخر کے خالی حروف ہٹانے کے بعد مکمل URL |
| `isSameOrigin` | کیا URL کا پروٹوکول، ہوسٹ اور پورٹ اس دستاویز کے اوریجن سے مطابقت رکھتے ہیں جس میں ایڈیٹر موجود ہے |
| `path` | `/` سے شروع ہونے والا پاتھ، کوئری اور فریگمنٹ سمیت۔ مثال: `/posts/1?a=2#top` |

```ts
const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#editor')!,
  onPasteUrl(url, isSameOrigin, path) {
    if (isSameOrigin && path === '/guide') return 'NABI NOTE'
    return url
  },
})
```

اگر واپس کی گئی اسٹرنگ میں خالی حروف کے علاوہ کوئی حرف ہو، تو وہ دکھائی دینے والا متن بن جاتی ہے۔ کال بیک موجود نہ ہو، خالی یا غیر اسٹرنگ قدر واپس کرے، یا ناکام ہو، تو پیسٹ کیا گیا URL ہی دکھائی دینے والا متن رہتا ہے۔ واپس کی گئی اسٹرنگ کو کبھی HTML نہیں سمجھا جاتا اور وہ لنک کا پتہ نہیں بدلتی۔

کال بیک `async` فنکشن اور Promise کو بھی سپورٹ کرتا ہے۔ جواب کا انتظار کرتے ہوئے URL لنک فوراً شامل کر دیا جاتا ہے؛ بعد میں درست نتیجہ آنے پر صرف اسی لنک کا دکھائی دینے والا متن بدلتا ہے۔ اگر اس دوران لنک میں ترمیم ہو گئی ہو یا اسے حذف کر دیا گیا ہو، نئی دستاویز لوڈ ہو گئی ہو، یا surface اَن ماؤنٹ ہو گیا ہو، تو دیر سے آنے والا نتیجہ نظر انداز کیا جاتا ہے۔

## CSS اسٹائل

Beri gaya tautan biasa dengan `.nabi-content a`, dan tautan lampiran secara terpisah dengan `.nabi-content a[data-nabi-file]`.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

Bagian `::before` dan `::after` pada tautan lampiran dipakai untuk menampilkan ikon dan ekstensi file, jadi biasanya sebaiknya jangan mengganti atau menghapus `content`-nya.
