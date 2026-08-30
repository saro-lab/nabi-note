---
title: फ़ाइल अपलोड
description: फ़ाइल स्थानांतरण को अपने सेवा अपलोडर से जोड़ें।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# फ़ाइल अपलोड

फ़ाइल चुनना, drag and drop, और केवल फ़ाइलों वाली paste क्रिया को upload flow से जोड़ें। इस पृष्ठ का डेमो सर्वर पर फ़ाइल नहीं भेजता; असली सेवा में ऐसा uploader जोड़ें जो फ़ाइल लेकर URL लौटाए।

अपलोड का नतीजा image block में डालने के लिए image wing चाहिए। दूसरी फ़ाइलों को attachment link में डालने के लिए link wing चाहिए। सेवा दोनों रूप स्वीकार करे तो दोनों wings साफ़ तौर पर चुनें। अपलोड चलते समय editor लॉक रहता है और सफल फ़ाइलें एक undo step में एक साथ डाली जाती हैं।

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

सिर्फ़ `upload` चुनने पर वह image या link की अनुपस्थित dependency अपने-आप देता है। स्थानांतरण को `mountUpload()` से और संपादन स्क्रीन की प्रगति UI को सामान्यतः `mountUploadView()` से जोड़ें। सर्वर HTTPS URL लौटाता हो तो local URL विकल्प जरूरी नहीं है।

## सर्वर API अनुबंध

NABI NOTE अपने-आप आपकी सेवा को फ़ाइल नहीं भेजता। `uploader` function एक फ़ाइल सर्वर को भेजता है और सफलता पर केवल public या authenticated `https:` URL लौटाता है। सबसे सरल API अनुबंध ऐसा है।

```text
POST /api/uploads
Content-Type: multipart/form-data
Field name: file

Success: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Failure: 4xx or 5xx response
```

सर्वर को ब्राउज़र से आए मूल फ़ाइल नाम, extension या MIME value पर ही भरोसा नहीं करना चाहिए। पहले authentication और permission जाँचें, streaming के समय फ़ाइल आकार सीमित करें और असली फ़ाइल प्रकार देखें। रखा जाने वाला नाम सर्वर पर बनाएँ। चित्रों को जरूरत पर फिर encode करें या thumbnail बनाएँ। अगर फ़ाइलें सभी को डाउनलोड नहीं करनी चाहिए, तो public URL के बजाय authentication माँगने वाला download path लौटाएँ।

| सर्वर की जाँच | कारण |
| --- | --- |
| लॉग-इन उपयोगकर्ता और upload permission | दूसरे उपयोगकर्ता के storage में लिखना रोकता है |
| प्रति फ़ाइल और पूरे request का आकार | memory और storage समाप्त होने से बचाता है |
| अनुमति वाला वास्तविक MIME type और extension | बदले extension वाली executable फ़ाइलें रोकता है |
| random stored name और अलग storage | path manipulation और मौजूदा फ़ाइल overwrite रोकता है |
| response URL की access और expiry policy | केवल URL के कारण private फ़ाइल खुलने से बचाती है |

Client-side `extensions` और `maxFileSize` तेज़ user feedback का पहला कदम भर हैं। वही सीमाएँ सर्वर पर भी लगाएँ।

## ब्राउज़र में अपलोडर जोड़ें

नीचे का उदाहरण NABI NOTE की अपेक्षित वास्तविक कड़ी है। इसमें `XMLHttpRequest` है, क्योंकि ब्राउज़र का मानक `fetch()` upload progress नहीं देता। सर्वर response से केवल `url` लौटाएँ; चित्र image blocks और दूसरी फ़ाइलें attachment links बनती हैं।

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
  { locale: 'hi' },
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
  locale: 'hi',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'hi' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'hi',
})
```

`fileSink: upload.take` जोड़ें, ताकि drag and drop और केवल फ़ाइलों वाली paste upload flow में आए। upload wing UI फ़ाइल चयन बटन का परिणाम `upload.take()` तक देता है। अपलोड के दौरान editor लॉक रहता है और हर batch की सफल फ़ाइलें एक undo step में डाली जाती हैं। `upload.cancel()` या `uploadView` का रद्द करें बटन `AbortSignal` के माध्यम से चल रहे request रोकता है।

## विफलता और सफ़ाई

सर्वर error response दे या `uploader` `null` लौटाए तो वह फ़ाइल दस्तावेज़ में नहीं डाली जाती। उसी batch की दूसरी फ़ाइलें फिर भी संसाधित होती हैं। कुल आकार सीमा पार होने पर पूरा batch शुरू नहीं होता। स्क्रीन बंद करते समय creation के उलटे क्रम में unmount करें।

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

सिर्फ़ development में तुरंत preview के लिए `blob:` URL प्रयोग कर सकते हैं। तब editor assembly, image wing और upload wing में `allowLocalUrls: true` चालू करें। वास्तविक server upload HTTPS URL लौटाए तो यह विकल्प न चालू करना अधिक सुरक्षित है।

## CSS शैली

पूर्ण हुई साधारण फ़ाइलें link wing के ज़रिए `a[data-nabi-file]` के रूप में दिखाई जाती हैं। published view में केवल attachment का रूप बदलना हो तो यह selector उपयोग करें।

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

Image upload के नतीजे image wing के CSS का अनुसरण करते हैं। Upload progress केवल editing view में दिखती है, इसलिए published view CSS को progress state बनाने की जरूरत नहीं है।
