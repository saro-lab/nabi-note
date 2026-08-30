---
title: ఫైల్ అప్‌లోడ్
description: ఫైల్ బదిలీని మీ సేవ అప్‌లోడర్‌తో అనుసంధానించండి.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ఫైల్ అప్‌లోడ్

ఫైల్ ఎంచుకోవడం, లాగి వదలడం, ఫైల్‌లు మాత్రమే ఉన్న అతికింపు చర్యలను అప్‌లోడ్ ప్రవాహానికి కలపండి. ఈ పేజీ డెమో ఫైళ్లను సర్వర్‌కు పంపదు; వాస్తవ సేవలో ఫైల్ తీసుకుని URL ఇచ్చే అప్‌లోడర్‌ను అనుసంధానించాలి.

అప్‌లోడ్ ఫలితాలను చిత్ర బ్లాక్‌లుగా చేర్చడానికి image wing అవసరం. ఇతర ఫైళ్లను జోడింపు లింక్‌లుగా చేర్చడానికి link wing అవసరం. మీ సేవ రెండు రూపాలనూ స్వీకరిస్తే రెండు వింగ్స్‌ను స్పష్టంగా ఎంచుకోండి. అప్‌లోడ్ నడుస్తున్నప్పుడు ఎడిటర్ లాక్ అవుతుంది; విజయవంతమైన ఫైళ్లు ఒకే అన్‌డూ దశగా కలిపి చేర్చబడతాయి.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

మీరు `upload`ను మాత్రమే ఎంచుకుంటే image లేదా link ఆధారాల్లో లేనిదాన్ని అది స్వయంగా అందిస్తుంది. బదిలీని `mountUpload()`తో, ఎడిటింగ్ స్క్రీన్ పురోగతి UIని సాధారణంగా `mountUploadView()`తో కలుపుతారు. సర్వర్ HTTPS URLలను ఇస్తే స్థానిక URL ఎంపిక అవసరం లేదు.

## సర్వర్ API ఒప్పందం

NABI NOTE స్వయంగా మీ సర్వర్‌కు ఫైళ్లను పంపదు. `uploader` ఫంక్షన్ ఒక్క ఫైల్‌ను సర్వర్‌కు పంపి, విజయం సాధిస్తే పబ్లిక్ లేదా ప్రామాణీకరించిన `https:` URLను మాత్రమే ఇస్తుంది. అత్యంత సరళమైన API ఒప్పందం ఇలా ఉంటుంది.

```text
POST /api/uploads
Content-Type: multipart/form-data
Field name: file

Success: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Failure: 4xx or 5xx response
```

బ్రౌజర్ పంపిన అసలు ఫైల్ పేరు, ఎక్స్‌టెన్షన్ లేదా MIME విలువను మాత్రమే సర్వర్ నమ్మకూడదు. ముందుగా ప్రామాణీకరణ, అనుమతిని తనిఖీ చేసి, స్ట్రీమింగ్ సమయంలో ఫైల్ పరిమాణాన్ని పరిమితం చేసి, అసలు ఫైల్ రకాన్ని పరిశీలించండి. నిల్వ పేరు సర్వర్‌లోనే సృష్టించండి. చిత్రాలను అవసరమైనప్పుడు మళ్లీ ఎన్‌కోడ్ చేయండి లేదా సూక్ష్మచిత్రాలను సృష్టించండి. అప్‌లోడ్ చేసిన ఫైళ్లు అందరికీ డౌన్‌లోడ్ చేయదగినవి కాకూడదంటే పబ్లిక్ URLకు బదులుగా ప్రామాణీకరణ కోరే డౌన్‌లోడ్ మార్గాన్ని ఇవ్వండి.

| సర్వర్‌లో తనిఖీ | కారణం |
| --- | --- |
| లాగిన్ అయిన వినియోగదారు, అప్‌లోడ్ అనుమతి | మరొకరి నిల్వలో రాయడాన్ని అడ్డుకుంటుంది |
| ఒక్కో ఫైల్, మొత్తం అభ్యర్థన పరిమాణం | మెమరీ, నిల్వ ఖాళీ కావడాన్ని అడ్డుకుంటుంది |
| అనుమతించిన అసలు MIME రకం, ఎక్స్‌టెన్షన్ | పేరు మార్చిన ఎక్స్‌టెన్షన్‌లున్న ఎగ్జిక్యూటబుల్ ఫైళ్లను అడ్డుకుంటుంది |
| యాదృచ్ఛిక నిల్వ పేరు, వేరు చేసిన నిల్వ | మార్గ మార్పిడి, ఉన్న ఫైళ్లను ఓవర్‌రైట్ చేయడాన్ని అడ్డుకుంటుంది |
| స్పందన URL ప్రాప్యత, గడువు విధానం | URL ఒక్కటే ఉండటం వలన ప్రైవేట్ ఫైళ్లు బయటపడకుండా చేస్తుంది |

క్లయింట్ వైపు `extensions`, `maxFileSize` వినియోగదారుకు త్వరిత స్పందన ఇచ్చే మొదటి దశ మాత్రమే. అదే పరిమితులను సర్వర్‌లో కూడా పెట్టండి.

## బ్రౌజర్‌లో అప్‌లోడర్‌ను కలపడం

కింద ఉన్న ఉదాహరణ NABI NOTE ఎదురుచూసే నిజమైన అనుసంధానం. బ్రౌజర్ ప్రామాణిక `fetch()` అప్‌లోడ్ పురోగతిని ఇవ్వదు కాబట్టి ఇందులో `XMLHttpRequest`ను ఉపయోగించారు. సర్వర్ స్పందనలోని `url`ను మాత్రమే తిరిగి ఇవ్వండి; చిత్రాలు image blockలవుతాయి, ఇతర ఫైళ్లు attachment linkలవుతాయి.

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
  { locale: 'te' },
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
  locale: 'te',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'te' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'te',
})
```

`fileSink: upload.take`ను కలపండి; అప్పుడు లాగి వదలడం, ఫైల్‌లు మాత్రమే ఉన్న అతికింపు చర్యలు అప్‌లోడ్ ప్రవాహంలోకి వస్తాయి. upload wing UI ఫైల్ ఎంపిక బటన్ ఫలితాలను `upload.take()`కు పంపుతుంది. అప్‌లోడ్ సమయంలో ఎడిటర్ లాక్ అవుతుంది; ప్రతి బ్యాచ్‌లోని విజయవంతమైన ఫైళ్లు ఒకే అన్‌డూ దశగా చేర్చబడతాయి. `upload.cancel()` లేదా `uploadView`లోని రద్దు బటన్ `AbortSignal` ద్వారా నడుస్తున్న అభ్యర్థనలను ఆపుతుంది.

## వైఫల్యం మరియు శుభ్రపరచడం

సర్వర్ లోప స్పందన ఇస్తే లేదా `uploader` `null` ఇస్తే ఆ ఫైల్ పత్రంలో చేర్చబడదు. అదే బ్యాచ్‌లోని ఇతర ఫైళ్ల ప్రాసెసింగ్ కొనసాగుతుంది. మొత్తం పరిమాణ పరిమితి దాటితే మొత్తం బ్యాచ్ మొదలవదు. స్క్రీన్ మూసేటప్పుడు సృష్టించిన క్రమానికి వ్యతిరేకంగా unmount చేయండి.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

అభివృద్ధి సమయంలో మాత్రమే తక్షణ ప్రివ్యూకు `blob:` URLలను ఉపయోగించవచ్చు. ఆ సందర్భంలో ఎడిటర్ అసెంబ్లీ, image wing, upload wingలో `allowLocalUrls: true`ను ఆన్ చేయండి. వాస్తవ సర్వర్ అప్‌లోడ్లు HTTPS URLలను ఇస్తే ఈ ఎంపికను ఆన్ చేయకపోవడం మరింత సురక్షితం.

## CSS శైలులు

పూర్తయిన సాధారణ ఫైళ్లు link wing ద్వారా `a[data-nabi-file]`గా చూపబడతాయి. ప్రచురిత వీక్షణలో జోడింపు రూపాన్ని మాత్రమే మార్చాలనుకున్నప్పుడు ఈ సెలెక్టర్‌ను ఉపయోగించండి.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

చిత్ర అప్‌లోడ్ ఫలితాలు image wing CSSను అనుసరిస్తాయి. అప్‌లోడ్ పురోగతి ఎడిటింగ్ వీక్షణలోనే కనిపిస్తుంది కాబట్టి ప్రచురిత వీక్షణ CSSకు పురోగతి స్థితిని సృష్టించాల్సిన అవసరం లేదు.
