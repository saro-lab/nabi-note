---
title: فائل اپ لوڈ
description: فائل کی منتقلی کو اپنی سروس کے uploader سے جوڑیں۔
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# فائل اپ لوڈ

فائل انتخاب، drag and drop، اور صرف فائلوں پر مشتمل paste کارروائیوں کو اپ لوڈ flow سے جوڑیں۔ اس صفحے کا ڈیمو فائلیں سرور کو نہیں بھیجتا؛ حقیقی سروس میں آپ کو ایسا uploader جوڑنا ہو گا جو فائل وصول کر کے URL واپس کرے۔

اپ لوڈ کے نتائج کو تصویر بلاکس کے طور پر شامل کرنے کے لیے image wing درکار ہے۔ دوسری فائلوں کو attachment links کے طور پر شامل کرنے کے لیے link wing درکار ہے۔ اگر آپ کی سروس دونوں فارمیٹس قبول کرتی ہے تو دونوں ونگز واضح طور پر منتخب کریں۔ اپ لوڈ جاری رہنے کے دوران ایڈیٹر مقفل رہتا ہے، اور کامیاب فائلیں ایک undo قدم کے طور پر اکٹھی شامل ہوتی ہیں۔

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

اگر آپ صرف `upload` منتخب کریں تو یہ image یا link dependencies میں سے جو غائب ہو اسے خودکار طور پر فراہم کرتا ہے۔ منتقلی `mountUpload()` سے منسلک ہوتی ہے، اور ترمیمی اسکرین کا progress UI عموماً `mountUploadView()` سے جوڑا جاتا ہے۔ اگر سرور HTTPS URLs واپس کرے تو مقامی URL اختیار کی ضرورت نہیں۔

## سرور API معاہدہ

NABI NOTE خود سے آپ کے سرور کو فائلیں نہیں بھیجتا۔ `uploader` فنکشن ایک فائل سرور کو بھیجتا ہے، اور کامیابی پر صرف عوامی یا authenticated `https:` URL واپس کرتا ہے۔ سب سے سادہ API معاہدہ یوں ہے۔

```text
POST /api/uploads
Content-Type: multipart/form-data
Field name: file

Success: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Failure: 4xx or 5xx response
```

سرور کو صرف براؤزر کے بھیجے گئے اصل فائل نام، extension یا MIME قدر پر بھروسا نہیں کرنا چاہیے۔ پہلے authentication اور اجازت جانچیں، streaming کے دوران فائل کا حجم محدود کریں، اور اصل فائل کی قسم کی پڑتال کریں۔ محفوظ کیا جانے والا نام سرور پر بنائیں۔ تصاویر کے لیے ضرورت پر انہیں دوبارہ encode کریں یا thumbnails بنائیں۔ اگر اپ لوڈ شدہ فائلیں ہر شخص کے لیے قابلِ ڈاؤن لوڈ نہیں ہونی چاہییں تو عوامی URL کے بجائے authentication درکار ڈاؤن لوڈ راستہ واپس کریں۔

| سرور پر جانچ | وجہ |
| --- | --- |
| لاگ ان صارف اور اپ لوڈ کی اجازت | دوسرے صارف کے اسٹوریج میں لکھنے سے روکتی ہے |
| ہر فائل کا حجم اور کل درخواست کا حجم | میموری اور اسٹوریج ختم ہونے سے روکتا ہے |
| اجازت یافتہ اصل MIME قسم اور extension | بدلے ہوئے extension والی executable فائلوں کو روکتا ہے |
| بے ترتیب محفوظ نام اور الگ تھلگ اسٹوریج | راستے میں تبدیلی اور موجودہ فائلوں کو اووررائٹ کرنے سے روکتا ہے |
| جواب URL کی رسائی اور میعاد ختم ہونے کی پالیسی | نجی فائلوں کو صرف URL سے ظاہر ہونے سے روکتی ہے |

کلائنٹ سائیڈ `extensions` اور `maxFileSize` صارف کو تیز رائے دینے کا صرف پہلا قدم ہیں۔ یہی حدود سرور پر بھی مقرر کریں۔

## براؤزر میں uploader منسلک کرنا

نیچے کی مثال وہ حقیقی کنکشن ہے جس کی NABI NOTE کو توقع ہے۔ یہ `XMLHttpRequest` استعمال کرتی ہے کیونکہ براؤزر کا معیاری `fetch()` اپ لوڈ progress فراہم نہیں کرتا۔ سرور کے جواب سے صرف `url` واپس کریں؛ تصاویر image blocks اور دوسری فائلیں attachment links بن جاتی ہیں۔

```ts
import {
  createNabiWith,
  mountSurface,
  mountUpload,
  mountUploadView,
  wings,
  type UploadTask,
} from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const { nabi, registry } = createNabiWith(
  wings().use('img').use('a').use('upload').build(),
  { locale: 'en' },
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
  locale: 'en',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'en' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'en',
})
```

`fileSink: upload.take` جوڑیں تاکہ drag and drop، اور صرف فائلوں پر مشتمل paste کارروائیاں اپ لوڈ flow میں داخل ہوں۔ upload wing UI، فائل انتخاب بٹن کے نتائج `upload.take()` کو دیتا ہے۔ اپ لوڈ جاری رہنے کے دوران ایڈیٹر مقفل رہتا ہے، اور ہر batch کی کامیاب فائلیں ایک undo قدم کے طور پر شامل ہوتی ہیں۔ `upload.cancel()` یا `uploadView` میں cancel بٹن، جاری درخواستوں کو `AbortSignal` کے ذریعے ختم کرتا ہے۔

## ناکامی اور صفائی

اگر سرور error response واپس کرے یا `uploader`، `null` واپس کرے تو وہ فائل دستاویز میں شامل نہیں ہوتی۔ اسی batch کی دوسری فائلوں پر کارروائی جاری رہتی ہے۔ کل حجم کی حد سے تجاوز ہونے پر پورا batch شروع نہیں ہوتا۔ اسکرین بند کرتے وقت تخلیق کی الٹی ترتیب میں unmount کریں۔

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

صرف ترقی کے دوران، فوری پیش نظارے کے لیے `blob:` URLs استعمال کیے جا سکتے ہیں۔ اس صورت میں editor assembly، image wing اور upload wing میں `allowLocalUrls: true` آن کریں۔ اگر اصل سرور اپ لوڈز HTTPS URLs واپس کرتے ہوں تو اس اختیار کو فعال نہ کرنا زیادہ محفوظ ہے۔

## CSS طرزیں

مکمل عام فائلیں link wing کے ذریعے `a[data-nabi-file]` کی صورت میں دکھائی جاتی ہیں۔ جب آپ صرف شائع شدہ منظر میں attachment کی شکل بدلنا چاہیں تو یہ سلیکٹر استعمال کریں۔

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

تصویر اپ لوڈ کے نتائج image wing کے CSS کی پیروی کرتے ہیں۔ اپ لوڈ progress صرف ترمیمی منظر میں ظاہر ہوتی ہے، اس لیے شائع شدہ منظر کے CSS کو progress حالت بنانے کی ضرورت نہیں۔
