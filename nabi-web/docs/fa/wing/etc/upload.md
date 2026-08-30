---
title: بارگذاری فایل
description: انتقال فایل را به uploader سرویس خود متصل کنید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# بارگذاری فایل

انتخاب فایل، drag and drop و عملیات paste که تنها شامل فایل هستند را به جریان بارگذاری متصل کنید. دموی این صفحه فایلی به سرور نمی‌فرستد؛ در سرویس واقعی باید uploaderی متصل کنید که فایل را دریافت و URL برگرداند.

برای واردکردن نتیجه‌های بارگذاری به‌شکل بلوک تصویر، wing تصویر لازم است. برای واردکردن فایل‌های دیگر به‌شکل پیوند پیوست، wing پیوند لازم است. اگر سرویس شما هر دو قالب را می‌پذیرد، هر دو wing را صریحاً انتخاب کنید. هنگام بارگذاری، ویرایشگر قفل است و فایل‌های موفق با هم در یک گام undo وارد می‌شوند.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

اگر فقط `upload` را انتخاب کنید، وابستگی گم‌شدهٔ تصویر یا پیوند را خودکار فراهم می‌کند. انتقال با `mountUpload()` متصل می‌شود و UI پیشرفت در صفحهٔ ویرایش معمولاً با `mountUploadView()` متصل می‌شود. اگر سرور URLهای HTTPS برگرداند، گزینهٔ URL محلی لازم نیست.

## قرارداد API سرور

NABI NOTE به‌خودی‌خود فایل‌ها را به سرور شما نمی‌فرستد. تابع `uploader` یک فایل را به سرور می‌فرستد و در موفقیت فقط یک URL عمومی یا دارای احراز هویت `https:` برمی‌گرداند. ساده‌ترین قرارداد API چنین است.

```text
POST /api/uploads
Content-Type: multipart/form-data
Field name: file

Success: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Failure: 4xx or 5xx response
```

سرور نباید تنها به نام اصلی فایل، پسوند یا مقدار MIME فرستاده‌شده از مرورگر اعتماد کند. ابتدا احراز هویت و مجوز را بررسی کنید، هنگام stream اندازهٔ فایل را محدود و نوع واقعی فایل را وارسی کنید. نام ذخیره‌شده را در سرور بسازید. برای تصویرها در صورت نیاز بازرمزگذاری یا thumbnail بسازید. اگر فایل‌های بارگذاری‌شده نباید برای همه قابل‌دریافت باشند، به‌جای URL عمومی مسیر دانلودِ نیازمند احراز هویت برگردانید.

| بررسی در سرور | دلیل |
| --- | --- |
| کاربر واردشده و مجوز بارگذاری | از نوشتن در فضای ذخیره‌سازی کاربر دیگر جلوگیری می‌کند |
| اندازهٔ هر فایل و اندازهٔ کل درخواست | از فرسودگی حافظه و ذخیره‌سازی جلوگیری می‌کند |
| نوع MIME واقعی و پسوند مجاز | فایل‌های اجرایی با پسوند تغییرکرده را مسدود می‌کند |
| نام ذخیره‌شدهٔ تصادفی و ذخیره‌سازی جدا | از دست‌کاری مسیر و بازنویسی فایل موجود جلوگیری می‌کند |
| سیاست دسترسی و انقضای URL پاسخ | از آشکارشدن فایل خصوصی صرفاً با URL جلوگیری می‌کند |

`extensions` و `maxFileSize` سمت کاربر فقط نخستین گام برای بازخورد سریع به کاربرند. همان محدودیت‌ها را در سرور نیز بگذارید.

## اتصال uploader در مرورگر

نمونهٔ زیر اتصال واقعیِ مورد انتظار NABI NOTE است. از `XMLHttpRequest` استفاده می‌کند، زیرا `fetch()` استاندارد مرورگر پیشرفت بارگذاری را نمی‌دهد. از پاسخ سرور فقط `url` را برگردانید؛ تصویرها به بلوک تصویر و فایل‌های دیگر به پیوند پیوست تبدیل می‌شوند.

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

`fileSink: upload.take` را متصل کنید تا drag and drop و pasteهای فقط‌فایل وارد جریان بارگذاری شوند. UI wing بارگذاری نتیجه‌های دکمهٔ انتخاب فایل را به `upload.take()` می‌دهد. هنگام بارگذاری ویرایشگر قفل است و فایل‌های موفق هر batch در یک گام undo وارد می‌شوند. `upload.cancel()` یا دکمهٔ لغو در `uploadView` درخواست‌های درحال‌اجرا را با `AbortSignal` متوقف می‌کند.

## خطا و پاک‌سازی

اگر سرور پاسخ خطا دهد یا `uploader` مقدار `null` برگرداند، آن فایل وارد سند نمی‌شود. پردازش فایل‌های دیگر همان batch ادامه می‌یابد. اگر از محدودیت اندازهٔ کل عبور شود، کل batch آغاز نمی‌شود. هنگام بستن صفحه، با ترتیب معکوس ساخت unmount کنید.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

تنها هنگام توسعه می‌توانید برای پیش‌نمایش فوری از URLهای `blob:` استفاده کنید. در این صورت `allowLocalUrls: true` را در پیکربندی ویرایشگر، wing تصویر و wing بارگذاری روشن کنید. اگر بارگذاری واقعی سرور URLهای HTTPS برمی‌گرداند، فعال نکردن این گزینه امن‌تر است.

## سبک‌های CSS

فایل‌های عادیِ کامل‌شده از راه wing پیوند به‌شکل `a[data-nabi-file]` نشان داده می‌شوند. وقتی فقط می‌خواهید ظاهر پیوست را در نمای منتشرشده تغییر دهید از این selector استفاده کنید.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

نتیجه‌های بارگذاری تصویر از CSS wing تصویر پیروی می‌کنند. پیشرفت بارگذاری فقط در نمای ویرایش ظاهر می‌شود، پس CSS نمای منتشرشده لازم نیست وضعیت پیشرفت بسازد.
