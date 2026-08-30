---
title: ফাইল আপলোড
description: ফাইল স্থানান্তরকে আপনার পরিষেবার আপলোডারের সঙ্গে যুক্ত করুন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ফাইল আপলোড

ফাইল বাছাই, টেনে এনে ছাড়া এবং শুধু ফাইল থাকা পেস্টের কাজকে আপলোড প্রবাহের সঙ্গে যুক্ত করুন। এই পাতার ডেমো সার্ভারে ফাইল পাঠায় না; বাস্তব পরিষেবায় ফাইল নিয়ে URL ফেরত দেয় এমন একটি আপলোডার আপনাকেই যুক্ত করতে হবে।

আপলোডের ফল ছবির ব্লক হিসেবে বসাতে image wing প্রয়োজন। অন্য ফাইল সংযুক্তি লিঙ্ক হিসেবে বসাতে link wing প্রয়োজন। আপনার পরিষেবা উভয় ফরম্যাট গ্রহণ করলে দুটি wing-ই স্পষ্টভাবে নির্বাচন করুন। আপলোড চলাকালে সম্পাদকটি লক থাকে এবং সফল ফাইলগুলো একসঙ্গে একটি undo ধাপে যোগ হয়।

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

শুধু `upload` নির্বাচন করলে image বা link-এর যে একটি নির্ভরতা অনুপস্থিত থাকে, সেটি স্বয়ংক্রিয়ভাবে যোগ হয়। স্থানান্তর `mountUpload()` দিয়ে যুক্ত করুন এবং সম্পাদনা পর্দায় অগ্রগতির UI সাধারণত `mountUploadView()` দিয়ে যুক্ত করা হয়। সার্ভার HTTPS URL ফেরত দিলে local URL বিকল্পের প্রয়োজন নেই।

## সার্ভার API চুক্তি

NABI NOTE নিজে আপনার সার্ভারে ফাইল পাঠায় না। `uploader` ফাংশনটি একটি করে ফাইল সার্ভারে পাঠায় এবং সফল হলে কেবল একটি public বা authenticated `https:` URL ফেরত দেয়। সবচেয়ে সহজ API চুক্তিটি এমন।

```text
POST /api/uploads
Content-Type: multipart/form-data
ফিল্ডের নাম: file

সফল: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
ব্যর্থ: 4xx অথবা 5xx প্রতিক্রিয়া
```

সার্ভারকে কেবল মূল ফাইলের নাম, extension বা ব্রাউজার পাঠানো MIME মান বিশ্বাস করা চলবে না। আগে authentication ও permission যাচাই করুন, streaming চলাকালে ফাইলের আকার সীমিত করুন এবং আসল ফাইলের ধরন পরীক্ষা করুন। সংরক্ষণের নাম সার্ভারেই তৈরি করুন। ছবির ক্ষেত্রে প্রয়োজনে re-encode করুন অথবা thumbnail তৈরি করুন। আপলোড করা ফাইল সবাই যেন ডাউনলোড করতে না পারে, সে ক্ষেত্রে public URL-এর বদলে authentication লাগবে এমন download path ফেরত দিন।

| সার্ভারে যা পরীক্ষা করবেন | কারণ |
| --- | --- |
| লগ-ইন করা ব্যবহারকারী ও আপলোডের অনুমতি | অন্য ব্যবহারকারীর storage-এ লেখা ঠেকায় |
| প্রতিটি ফাইলের আকার ও মোট request-এর আকার | memory ও storage ফুরিয়ে যাওয়া ঠেকায় |
| অনুমোদিত আসল MIME type ও extension | নাম পাল্টানো executable file আটকায় |
| এলোমেলো সংরক্ষণের নাম ও আলাদা storage | path manipulation ও বিদ্যমান file overwrite ঠেকায় |
| response URL-এর access ও expiry policy | শুধু URL দিয়েই private file প্রকাশ পাওয়া ঠেকায় |

ক্লায়েন্টের `extensions` এবং `maxFileSize` ব্যবহারকারীকে দ্রুত জানানো প্রথম ধাপমাত্র। সার্ভারেও একই সীমা দিন।

## ব্রাউজারে আপলোডার যুক্ত করা

নিচের উদাহরণটি NABI NOTE যে বাস্তব সংযোগ প্রত্যাশা করে তা দেখায়। এটি `XMLHttpRequest` ব্যবহার করে, কারণ ব্রাউজারের মানক `fetch()` upload progress দেয় না। সার্ভারের response থেকে কেবল `url` ফেরত দিন; ছবি image block হবে, আর অন্য ফাইল attachment link হবে।

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
  { locale: 'bn' },
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
    request.addEventListener('error', () => reject(new Error('আপলোডের অনুরোধ ব্যর্থ হয়েছে।')))
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
  locale: 'bn',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'bn' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'bn',
})
```

`fileSink: upload.take` যুক্ত করুন, যাতে টেনে এনে ছাড়া এবং শুধু ফাইল থাকা পেস্টের কাজ upload flow-তে প্রবেশ করে। upload wing-এর UI ফাইল বাছাই বোতামের ফল `upload.take()`-এ পাঠায়। আপলোড চলাকালে সম্পাদকটি লক থাকে এবং প্রতিটি batch-এর সফল ফাইলগুলো একটি undo ধাপে যোগ হয়। `upload.cancel()` অথবা `uploadView`-এর cancel বোতাম `AbortSignal`-এর মাধ্যমে চলমান request বন্ধ করে।

## ব্যর্থতা ও পরিষ্কার করা

সার্ভার error response দিলে বা `uploader` `null` ফেরত দিলে ফাইলটি নথিতে ঢোকে না। একই batch-এর অন্য ফাইলগুলোর কাজ চলতে থাকে। মোট আকারের সীমা ছাড়িয়ে গেলে পুরো batch শুরুই হয় না। পর্দা বন্ধ করার সময় তৈরির বিপরীত ক্রমে unmount করুন।

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

শুধু development-এর সময় তাৎক্ষণিক preview-এর জন্য `blob:` URL ব্যবহার করতে পারেন। সে ক্ষেত্রে editor assembly, image wing এবং upload wing-এ `allowLocalUrls: true` চালু করুন। বাস্তব server upload HTTPS URL ফেরত দিলে এই বিকল্পটি চালু না রাখাই নিরাপদ।

## CSS শৈলী

সম্পন্ন সাধারণ ফাইল link wing-এর মাধ্যমে `a[data-nabi-file]` হিসেবে দেখানো হয়। প্রকাশিত view-তে শুধু attachment-এর চেহারা বদলাতে চাইলে এই selector ব্যবহার করুন।

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

ছবি আপলোডের ফল image wing-এর CSS অনুসরণ করে। upload progress কেবল সম্পাদনা view-তে দেখা যায়, তাই প্রকাশিত view-এর CSS-এ progress state তৈরির প্রয়োজন নেই।
