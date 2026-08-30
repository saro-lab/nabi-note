---
title: Kupakia Faili
description: Unganisha uhamishaji wa faili kwenye kipakiaji cha huduma yako.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Kupakia Faili

Unganisha uteuzi wa faili, kuburuta na kudondosha, na vitendo vya kubandika vyenye faili pekee kwenye mtiririko wa upakiaji. Onyesho kwenye ukurasa huu halitumi faili kwenye seva; katika huduma halisi, lazima uunganishe kipakiaji kinachopokea faili na kurudisha URL.

Ili kuingiza matokeo ya upakiaji kama blokii za picha, unahitaji wing ya picha. Ili kuingiza faili nyingine kama viungo vya viambatisho, unahitaji wing ya kiungo. Ikiwa huduma yako inakubali miundo yote miwili, chagua wing zote mbili waziwazi. Wakati upakiaji unaendelea, kihariri hufungwa, na faili zilizofanikiwa huingizwa pamoja kama hatua moja ya kutendua.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

Ukichagua `upload` pekee, huleta kiotomatiki utegemezi unaokosekana kati ya picha na kiungo. Uhamishaji huunganishwa kwa `mountUpload()`, na UI ya maendeleo ya skrini ya kuhariri kwa kawaida huunganishwa kwa `mountUploadView()`. Seva ikirudisha URL za HTTPS, chaguo la URL za ndani halihitajiki.

## Mkataba wa API ya Seva

NABI NOTE haitumi faili kwenye seva yako yenyewe. Kitendakazi cha `uploader` hutuma faili moja kwenye seva, na kikifaulu hurudisha URL ya `https:` ya umma au inayohitaji uthibitishaji pekee. Mkataba rahisi zaidi wa API unaonekana hivi.

```text
POST /api/uploads
Content-Type: multipart/form-data
Field name: file

Success: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Failure: 4xx or 5xx response
```

Seva haipaswi kuamini jina asili la faili, kiendelezi au thamani ya MIME inayotumwa na kivinjari pekee. Kwanza angalia uthibitishaji na ruhusa, punguza ukubwa wa faili inapopitishwa, na kagua aina halisi ya faili. Unda jina la kuhifadhi kwenye seva. Kwa picha, zisimbue upya au unda vijipicha inapohitajika. Ikiwa faili zilizopakiwa hazipaswi kupakuliwa na kila mtu, rudisha njia ya kupakua inayohitaji uthibitishaji badala ya URL ya umma.

| Ukaguzi kwenye seva | Sababu |
| --- | --- |
| Mtumiaji aliyeingia na ruhusa ya kupakia | Huzuia kuandika kwenye hifadhi ya mtumiaji mwingine |
| Ukubwa wa kila faili na wa ombi lote | Huzuia kumbukumbu na hifadhi kuisha |
| Aina halisi ya MIME na kiendelezi vinavyoruhusiwa | Huzuia faili tekelezi zilizopewa viendelezi vingine |
| Jina la kuhifadhi nasibu na hifadhi iliyotengwa | Huzuia kubadilisha njia na kufuta faili zilizopo |
| Ufikiaji wa URL ya jibu na sera ya muda wa kuisha | Huzuia faili binafsi kufichuliwa kwa URL pekee |

`extensions` na `maxFileSize` za upande wa mteja ni hatua ya kwanza tu ya kumpa mtumiaji mrejesho wa haraka. Weka vikomo hivyohivyo kwenye seva pia.

## Kuunganisha Kipakiaji Kwenye Kivinjari

Mfano hapa chini ni muunganisho halisi ambao NABI NOTE inatarajia. Unatumia `XMLHttpRequest` kwa sababu `fetch()` ya kawaida ya kivinjari haitoi maendeleo ya upakiaji. Rudisha `url` pekee kutoka kwenye jibu la seva; picha huwa blokii za picha, na faili nyingine huwa viungo vya viambatisho.

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

Unganisha `fileSink: upload.take` ili kuburuta na kudondosha, na vitendo vya kubandika vyenye faili pekee, viingie kwenye mtiririko wa upakiaji. UI ya wing ya kupakia hupitisha matokeo ya kitufe cha kuchagua faili kwa `upload.take()`. Wakati upakiaji unaendelea, kihariri hufungwa, na faili zilizofanikiwa kutoka kila kundi huingizwa kama hatua moja ya kutendua. `upload.cancel()` au kitufe cha kughairi katika `uploadView` husitisha maombi yanayoendelea kupitia `AbortSignal`.

## Kushindwa na Usafishaji

Seva ikirudisha jibu la hitilafu au `uploader` ikirudisha `null`, faili hiyo haiingizwi kwenye hati. Faili nyingine katika kundi lilelile zinaendelea kuchakatwa. Kikomo cha ukubwa wa jumla kikizidiwa, kundi lote halianzi. Unapofunga skrini, ondoa uunganisho kwa mpangilio wa kinyume wa uundaji.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

Wakati wa utengenezaji pekee, unaweza kutumia URL za `blob:` kwa onyesho la papo hapo. Katika hali hiyo, washa `allowLocalUrls: true` katika uundaji wa kihariri, wing ya picha, na wing ya kupakia. Upakiaji halisi wa seva ukirudisha URL za HTTPS, ni salama zaidi kutowasha chaguo hili.

## Mitindo ya CSS

Faili za kawaida zilizokamilika huonyeshwa kupitia wing ya kiungo kama `a[data-nabi-file]`. Tumia kiteuzi hiki unapokusudia kubadilisha mwonekano wa kiambatisho katika toleo lililochapishwa pekee.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

Matokeo ya kupakia picha hufuata CSS ya wing ya picha. Maendeleo ya upakiaji huonekana katika mwonekano wa kuhariri pekee, kwa hiyo CSS ya toleo lililochapishwa haihitaji kuunda hali ya maendeleo.
