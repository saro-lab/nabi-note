---
title: கோப்புப் பதிவேற்றம்
description: கோப்புப் பரிமாற்றத்தை உங்கள் சேவையின் பதிவேற்றியுடன் இணைக்கவும்.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# கோப்புப் பதிவேற்றம்

கோப்புத் தேர்வு, இழுத்து விடுதல், கோப்புகள் மட்டுமே உள்ள ஒட்டல் ஆகியவற்றைப் பதிவேற்ற ஓட்டத்துடன் இணைக்கவும். இந்தப் பக்க demo கோப்புகளைச் சேவையகத்திற்கு அனுப்பாது; உண்மையான சேவையில் கோப்பைப் பெற்று URL திருப்பும் பதிவேற்றியை இணைக்க வேண்டும்.

பதிவேற்ற முடிவை படத் தொகுதியாகச் சேர்க்க பட wing தேவை. பிற கோப்புகளை இணைப்புக் கோப்பாகச் சேர்க்க link wing தேவை. உங்கள் சேவை இரு வடிவங்களையும் ஏற்றால் இரு wing-களையும் தெளிவாகத் தேர்ந்தெடுக்கவும். பதிவேற்றம் நடக்கும்போது தொகுப்பி பூட்டப்படும்; வெற்றிகரமான கோப்புகள் ஒரே undo படியாகச் சேர்க்கப்படும்.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

`upload` ஐ மட்டும் தேர்ந்தெடுத்தால், இல்லாத பட அல்லது இணைப்பு சார்புகளில் ஒன்றைத் தானாகச் சேர்க்கும். பரிமாற்றம் `mountUpload()` மூலமும், திருத்தப் பக்க முன்னேற்ற UI பொதுவாக `mountUploadView()` மூலமும் இணைக்கப்படும். சேவையகம் HTTPS URL-களைத் திருப்பினால் உள்ளூர் URL விருப்பம் தேவையில்லை.

## பதிவேற்றம் சேர்க்கப்படும் இடம்

கோப்புத் தேர்வு சாளரம் திறக்கப்பட்ட அல்லது பதிவேற்றம் தொடங்கிய இடம் நினைவில் வைக்கப்படும். இடஞ்சுட்டியை மட்டும் நகர்த்தினாலும் அசல் இடத்தில் சேர்க்கப்படும். அட்டவணைக் கலத்தில் தொடங்கினால் முன்னேற்றக் காட்டியும் முடிந்த உள்ளடக்கமும் அதே கலத்திலேயே இருக்கும். மிதக்கும் பகுதியில் தொடங்கிய பதிவேற்றத்தின் முடிவும் அப்பகுதியில் சேரும். பல கலங்களின் எல்லைகளைக் கடக்கும் தேர்வில் பதிவேற்றத்தைச் சேர்க்க முடியாது.

கோப்புத் தேர்வு அல்லது ஒத்திசைவற்ற செயலாக்கத்தின்போது ஆவணத்தைத் திருத்துவது அல்லது மாற்றுவது சேர்த்தலை ரத்துசெய்து அறிவிப்பைக் காட்டும். செயல்தவிர்ப்பால் அதே உள்ளடக்கம் மீண்டாலும் பழைய இடத்தில் சேர்க்கப்படாது. பரிமாற்ற வெற்றியை மட்டும் வைத்து நிறைவைத் தீர்மானிக்காதீர்கள்: `onDone` பெறும் `committed` மற்றும் `cancelled` மதிப்புகளைச் சரிபார்க்கவும். `committed` என்பது ஆவணத்தில் உண்மையில் சேர்க்கப்பட்ட கோப்புகளின் எண்ணிக்கை.

## சேவையக API ஒப்பந்தம்

NABI NOTE தானாக உங்கள் சேவையகத்திற்குக் கோப்புகளை அனுப்பாது. `uploader` செயல்பாடு ஒரு கோப்பைச் சேவையகத்திற்கு அனுப்பி, வெற்றியில் பொது அல்லது அங்கீகரிக்கப்பட்ட `https:` URL-ஐ மட்டுமே திருப்பும். எளிய API ஒப்பந்தம் இதுபோல் இருக்கும்.

```text
POST /api/uploads
Content-Type: multipart/form-data
புலப் பெயர்: file

வெற்றி: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
தோல்வி: 4xx அல்லது 5xx பதில்
```

சேவையகம் மூலக் கோப்புப் பெயர், நீட்டிப்பு அல்லது உலாவி அனுப்பிய MIME மதிப்பை மட்டும் நம்பக்கூடாது. முதலில் அங்கீகாரத்தையும் அனுமதியையும் சரிபார்த்து, streaming போது கோப்பு அளவைக் கட்டுப்படுத்தி, உண்மையான கோப்பு வகையைச் சோதிக்கவும். சேமிப்புப் பெயரை சேவையகத்தில் புதிதாக உருவாக்கவும். படங்களைத் தேவைக்கேற்ப மீள்குறியாக்கவோ சிறுபடம் உருவாக்கவோ செய்யவும். பதிவேற்றிய கோப்புகளை எல்லோரும் பதிவிறக்கக் கூடாதெனில் பொது URL-க்கு பதில் அங்கீகாரம் தேவைப்படும் பதிவிறக்கப் பாதையைத் திருப்பவும்.

| சேவையகத்தில் சரிபார்ப்பது | காரணம் |
| --- | --- |
| உள்நுழைந்த பயனர், பதிவேற்ற அனுமதி | பிறரின் சேமிப்பிடத்தில் எழுதுவதைத் தடுக்கிறது |
| ஒவ்வொரு கோப்பு மற்றும் மொத்த கோரிக்கை அளவு | நினைவகம், சேமிப்பிடம் தீர்வதைத் தடுக்கிறது |
| அனுமதிக்கப்பட்ட உண்மை MIME வகை, நீட்டிப்பு | பெயர் மாற்றிய இயக்கக் கோப்புகளைத் தடுக்கிறது |
| சீரற்ற சேமிப்புப் பெயர், தனிமைப்படுத்திய சேமிப்பு | பாதை மாற்றம், கோப்பு மேலெழுதலைத் தடுக்கிறது |
| பதில் URL அணுகல், காலாவதி கொள்கை | தனிப்பட்ட கோப்புகள் URL மூலமே வெளிப்படுவதைத் தடுக்கிறது |

கிளையன்ட் பக்க `extensions` மற்றும் `maxFileSize` பயனருக்கு விரைவாகத் தெரிவிக்கும் முதல் படி மட்டுமே. அதே வரம்புகளைச் சேவையகத்திலும் கட்டாயம் அமைக்கவும்.

## உலாவியில் பதிவேற்றியை இணைத்தல்

கீழுள்ள எடுத்துக்காட்டு NABI NOTE எதிர்பார்க்கும் உண்மையான இணைப்பு. உலாவியின் இயல்புநிலை `fetch()` பதிவேற்ற முன்னேற்றத்தை வழங்காததால் `XMLHttpRequest` பயன்படுத்தப்படுகிறது. சேவையகப் பதிலில் இருந்து `url` ஐ மட்டும் திருப்பவும்; படங்கள் படத் தொகுதிகளாகவும் பிற கோப்புகள் இணைப்புக் கோப்புகளாகவும் மாறும்.

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
  { locale: 'ta' },
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
    request.addEventListener('error', () => reject(new Error('பதிவேற்றக் கோரிக்கை தோல்வியடைந்தது.')))
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
  locale: 'ta',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'ta' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'ta',
})

const toolbar = mountToolbar({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  surface: content,
  onFiles: upload.take,
  locale: 'ta',
})
```

இழுத்து விடுதலும் கோப்புகள் மட்டுமுள்ள ஒட்டலும் பதிவேற்றச் செயல்முறையில் சேர `fileSink: upload.take` ஐ இணைக்கவும். கோப்புத் தேர்வு பொத்தானைக் கருவிப்பட்டையின் `onFiles: upload.take` வழியாக இணைக்கவும். பதிவேற்றத்தின்போது தொகுப்பி பூட்டப்படும்; ஒவ்வொரு தொகுப்பின் வெற்றிகரமான கோப்புகளும் ஒரே செயல்தவிர்ப்பு படியாகச் சேர்க்கப்படும். `upload.cancel()` அல்லது `uploadView` இன் ரத்து பொத்தான் `AbortSignal` வழியாக நடந்துகொண்டிருக்கும் கோரிக்கைகளை நிறுத்தும்.

## தோல்வி மற்றும் சுத்தம் செய்தல்

சேவையகம் பிழைப் பதிலளித்தாலோ `uploader` `null` ஐத் திருப்பினாலோ அந்தக் கோப்பு ஆவணத்தில் சேர்க்கப்படாது. அதே தொகுப்பிலுள்ள பிற கோப்புகள் தொடர்ந்து செயலாக்கப்படும். மொத்த அளவு வரம்பு மீறப்பட்டால் முழுத் தொகுப்பும் தொடங்காது. திரையை மூடும்போது உருவாக்கிய வரிசையின் எதிர்வரிசையில் unmount செய்யவும்.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

மேம்பாட்டின்போது மட்டும் உடனடி முன்னோட்டத்திற்கு `blob:` URL-களைப் பயன்படுத்தலாம். அப்போது தொகுப்பி அமைப்பு, பட wing, upload wing ஆகிய ஒவ்வொன்றிலும் `allowLocalUrls: true` ஐ இயக்க வேண்டும். உண்மையான சேவையகப் பதிவேற்றங்கள் HTTPS URL-களைத் திருப்பினால் இந்த விருப்பத்தை இயக்காமல் இருப்பதே பாதுகாப்பானது.

## CSS பாணிகள்

நிறைவடைந்த சாதாரண கோப்புகள் link wing மூலம் `a[data-nabi-file]` ஆகக் காட்டப்படும். வெளியீட்டுப் பக்கத்தில் இணைப்பின் தோற்றத்தை மட்டும் மாற்ற இந்தத் தேர்வியைப் பயன்படுத்தவும்.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

படப் பதிவேற்ற முடிவுகள் பட wing இன் CSS-ஐப் பின்பற்றும். பதிவேற்ற முன்னேற்றம் திருத்தப் பக்கத்தில் மட்டுமே தோன்றுவதால், வெளியீட்டுப் பக்க CSS-ல் முன்னேற்ற நிலையை உருவாக்க வேண்டியதில்லை.
