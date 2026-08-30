---
title: फाइल अपलोड
description: तुमच्या सेवेच्या uploader शी फाइल हस्तांतरण जोडा.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# फाइल अपलोड

फाइल निवडणे, drag and drop आणि फक्त फाइल असलेल्या paste क्रिया upload flow शी जोडा. या पानावरील demo फाइल server कडे पाठवत नाही; खऱ्या सेवेत फाइल घेऊन URL परत करणारा uploader जोडावा लागतो.

अपलोडचा निकाल image block म्हणून घालण्यासाठी image wing आवश्यक आहे. इतर फाइल attachment link म्हणून घालण्यासाठी link wing आवश्यक आहे. तुमची सेवा दोन्ही स्वरूप स्वीकारत असल्यास दोन्ही wings स्पष्टपणे निवडा. upload सुरू असताना संपादक lock असतो आणि यशस्वी फाइल एकाच undo टप्प्यात एकत्र घातल्या जातात.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

फक्त `upload` निवडल्यास image किंवा link dependency पैकी जी अनुपस्थित असेल ती आपोआप पुरवली जाते. हस्तांतरण `mountUpload()` ने जोडले जाते आणि संपादन स्क्रीनचा प्रगती UI सहसा `mountUploadView()` ने जोडला जातो. server ने HTTPS URL परत केल्यास local URL option लागत नाही.

## Server API करार

NABI NOTE स्वतःहून तुमच्या server कडे फाइल पाठवत नाही. `uploader` function एक फाइल server कडे पाठवते आणि यशस्वी झाल्यावर फक्त public किंवा authentication असलेला `https:` URL परत करते. सर्वांत सोपा API करार असा दिसतो.

```text
POST /api/uploads
Content-Type: multipart/form-data
Field name: file

Success: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Failure: 4xx or 5xx response
```

Server ने browser ने पाठवलेल्या मूळ फाइलनावावर, extension वर किंवा MIME मूल्यावरच विश्वास ठेवू नये. आधी authentication व permission तपासा, streaming करताना फाइल आकार मर्यादित करा आणि खरा फाइल प्रकार तपासा. साठवलेले नाव server वर तयार करा. प्रतिमांसाठी आवश्यक असल्यास पुन्हा encode करा किंवा thumbnail तयार करा. अपलोड केलेल्या फाइल सर्वांना डाउनलोड करता येऊ नयेत तर public URL ऐवजी authentication लागणारा download path परत करा.

| Server वर तपासणी | कारण |
| --- | --- |
| लॉग इन केलेला वापरकर्ता आणि upload permission | दुसऱ्या वापरकर्त्याच्या storage मध्ये लिहिणे थांबवते |
| प्रत्येक फाइलचा व एकूण request चा आकार | memory आणि storage संपणे थांबवते |
| परवानगीचा खरा MIME प्रकार व extension | नाव बदललेल्या executable फाइल रोखते |
| यादृच्छिक साठवलेले नाव व वेगळे storage | path manipulation आणि आधीच्या फाइलचे overwrite रोखते |
| response URL चा प्रवेश व expiry policy | फक्त URL मुळे private फाइल उघड होणे रोखते |

Client बाजूचे `extensions` आणि `maxFileSize` वापरकर्त्याला लवकर प्रतिसाद देण्याची फक्त पहिली पायरी आहेत. ह्याच मर्यादा server वरही लावा.

## Browser मध्ये uploader जोडा

खालील उदाहरण NABI NOTE ला अपेक्षित असलेला खरा जोड आहे. browser चे standard `fetch()` upload progress देत नसल्यामुळे यात `XMLHttpRequest` वापरले आहे. server response मधून फक्त `url` परत करा; प्रतिमा image block होतात आणि इतर फाइल attachment link होतात.

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
  { locale: 'mr' },
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
  locale: 'mr',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'mr' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'mr',
})
```

`fileSink: upload.take` जोडा, म्हणजे drag and drop आणि फक्त फाइल असलेल्या paste क्रिया upload flow मध्ये जातील. upload wing UI फाइल निवड बटणाचे निकाल `upload.take()` कडे देते. upload सुरू असताना संपादक lock असतो आणि प्रत्येक batch मधील यशस्वी फाइल एकाच undo टप्प्यात घातल्या जातात. `upload.cancel()` किंवा `uploadView` मधील cancel button `AbortSignal` मधून सुरू असलेल्या request थांबवते.

## अयशस्वीता आणि साफसफाई

Server ने error response दिल्यास किंवा `uploader` ने `null` परत केल्यास ती फाइल दस्तऐवजात घातली जात नाही. त्याच batch मधील इतर फाइल प्रक्रिया होत राहतात. एकूण आकार मर्यादा ओलांडल्यास पूर्ण batch सुरू होत नाही. स्क्रीन बंद करताना तयार केल्याच्या उलट क्रमाने unmount करा.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

फक्त development दरम्यान तात्काळ preview साठी `blob:` URL वापरता येतात. त्या वेळी editor assembly, image wing आणि upload wing मध्ये `allowLocalUrls: true` सुरू करा. खरे server upload HTTPS URL परत करत असल्यास हा option सुरू न करणे अधिक सुरक्षित आहे.

## CSS शैली

पूर्ण झालेल्या सामान्य फाइल link wing मधून `a[data-nabi-file]` म्हणून दिसतात. प्रकाशित दृश्यात फक्त attachment चे रूप बदलायचे असेल तर हा selector वापरा.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

प्रतिमा upload चे निकाल image wing च्या CSS प्रमाणे असतात. upload प्रगती फक्त संपादन दृश्यात दिसते, त्यामुळे प्रकाशित दृश्याच्या CSS ला progress state तयार करण्याची गरज नाही.
