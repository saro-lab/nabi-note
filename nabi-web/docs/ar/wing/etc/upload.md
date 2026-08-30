---
title: رفع الملفات
description: يربط نقل الملفات بأداة الرفع في خدمتك.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# رفع الملفات

يربط اختيار الملفات والسحب والإفلات واللصق الذي يحتوي ملفات فقط بمسار الرفع. لا يرسل عرض هذه الصفحة الملفات إلى خادم؛ في الخدمة الفعلية يجب ربط uploader يستقبل ملفًا ويعيد URL.

لإدراج النتائج ككتل صور تحتاج image wing، ولإدراج الملفات الأخرى كروابط مرفقات تحتاج link wing. إذا قبلت خدمتك النوعين، فاختر wings كلتيهما صراحة. يُقفل المحرر أثناء الرفع، وتُدرج الملفات الناجحة معًا كخطوة تراجع واحدة.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

إذا اخترت `upload` وحدها، فهي توفر تلقائيًا اعتماد image أو link الناقص. يُربط النقل بـ`mountUpload()`، وتُربط واجهة تقدم التحرير عادة بـ`mountUploadView()`. إذا أعاد الخادم عناوين HTTPS، فلا حاجة لخيار العناوين المحلية.

## عقد API الخادم

لا يرسل NABI NOTE الملفات إلى خادمك بنفسه. ترسل دالة `uploader` ملفًا واحدًا، وتعيد عند النجاح عنوان `https:` عامًا أو محميًا فقط. أبسط عقد هو:

```text
POST /api/uploads
Content-Type: multipart/form-data
اسم الحقل: file

نجاح: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
فشل: استجابة 4xx أو 5xx
```

يجب ألا يثق الخادم باسم الملف الأصلي أو امتداده أو MIME الذي يرسله المتصفح وحدها. افحص تسجيل الدخول والصلاحية أولًا، وحدد الحجم أثناء القراءة المتدفقة، وافحص النوع الحقيقي. أنشئ اسم التخزين على الخادم. وأعد ترميز الصور أو أنشئ صورًا مصغرة عند الحاجة. إذا لم يكن الملف متاحًا للجميع، فأعد مسار تنزيل يتطلب تسجيل الدخول بدل URL عام.

| الفحص على الخادم | السبب |
| --- | --- |
| المستخدم المسجل وصلاحية الرفع | يمنع الكتابة في مساحة مستخدم آخر |
| حجم كل ملف والحجم الكلي للطلب | يمنع استنزاف الذاكرة والتخزين |
| MIME الحقيقي والامتداد المسموحان | يمنع الملفات التنفيذية ذات الامتداد المغير |
| اسم تخزين عشوائي ومساحة معزولة | يمنع التلاعب بالمسار واستبدال ملف قائم |
| صلاحية الوصول إلى URL وانتهاؤه | يمنع كشف الملفات الخاصة بالعنوان وحده |

إن `extensions` و`maxFileSize` في العميل خطوة أولى لإبلاغ المستخدم سريعًا فقط. طبّق الحدود نفسها على الخادم أيضًا.

## ربط uploader في المتصفح

يوضح المثال الاتصال الفعلي الذي يتوقعه NABI NOTE. يستخدم `XMLHttpRequest` لأن `fetch()` القياسي في المتصفح لا يوفر تقدم الرفع. أعد `url` فقط من استجابة الخادم؛ تتحول الصور إلى كتل صور، والملفات الأخرى إلى روابط مرفقات.

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
  { locale: 'ar' },
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
  locale: 'ar',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'ar' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'ar',
})
```

صِل `fileSink: upload.take` حتى يدخل السحب والإفلات واللصق الذي يحتوي ملفات فقط مسار الرفع. تمرر واجهة زر اختيار الملفات في upload wing النتائج إلى `upload.take()`. يُقفل المحرر أثناء الرفع، وتُدرج الملفات الناجحة من كل دفعة كخطوة تراجع واحدة. تلغي `upload.cancel()` أو زر الإلغاء في `uploadView` الطلبات الجارية عبر `AbortSignal`.

## الفشل والتنظيف

إذا أعاد الخادم خطأ أو أعادت `uploader` القيمة `null`، فلا يُدرج ذلك الملف. وتستمر معالجة بقية ملفات الدفعة. وإذا تجاوز الحجم الإجمالي الحد، فلا تبدأ الدفعة كلها. عند إغلاق الشاشة، فك التركيب بعكس ترتيب الإنشاء.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

في التطوير فقط، يمكن استخدام عناوين `blob:` للمعاينة الفورية. عندها فعّل `allowLocalUrls: true` في تجميع المحرر وimage wing وupload wing. إذا كان الرفع الحقيقي يعيد HTTPS، فمن الآمن عدم تمكينه.

## أنماط CSS

تعرض link wing الملفات العادية المكتملة كـ`a[data-nabi-file]`. استخدم هذا المحدد لتغيير شكل المرفق في صفحة النشر وحدها.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

تتبع صور الرفع CSS الخاصة بـimage wing. يظهر تقدم الرفع في شاشة التحرير فقط، لذلك لا تحتاج CSS صفحة النشر إلى إنشاء حالة تقدم.
