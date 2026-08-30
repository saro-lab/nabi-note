---
title: Loda fayil
description: Yana haɗa tura fayil da mai lodawar sabis.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Loda fayil

Yana haɗa zaɓen fayil, ja da saukewa, da liƙa abin da fayiloli kawai suke ciki zuwa tsarin loda fayil. Demo na wannan shafi ba ya aika komai zuwa sabar; a sabis ɗinka dole ne ka haɗa mai loda fayil da kan ka wanda zai karɓi fayil ya mayar da URL.

Domin saka sakamakon loda a matsayin tubalin hoto, ana bukatar wing ɗin hoto; domin saka sauran fayiloli a matsayin mahaɗin abin da aka haɗa, ana bukatar wing ɗin mahaɗi. Idan sabis yana karɓar nau'ikan biyu, zaɓi wings ɗin biyu a bayyane tare. Yayin lodawa editan yana kulle, kuma fayilolin da suka yi nasara suna shiga tare a mataki guda na soke aiki.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

Idan ka zaɓi `upload` shi kaɗai, zai ƙara ɗaya daga dogarorin hoto da mahaɗi wanda ba ya nan ta atomatik. Ana haɗa tura fayil da `mountUpload()`, kuma galibi ana haɗa nunin ci gaba na allon edita da `mountUploadView()`. Idan sabar ta mayar da URL na HTTPS, ba a bukatar zaɓin yarda da URL na gida.

## Yarjejeniyar API na sabar

NABI NOTE ba ya aika fayil zuwa sabar. Aikin `uploader` ne yake aika fayil guda zuwa sabar, kuma idan ya yi nasara ya mayar da URL na `https:` wanda jama'a ko masu izini kawai za su iya samu. Yarjejeniyar API mafi sauƙi ita ce kamar haka.

```text
POST /api/uploads
Content-Type: multipart/form-data
Sunan fili: file

Nasara: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Kuskure: amsar 4xx ko 5xx
```

Kada sabar ta amince da asalin sunan fayil, tsawo, ko MIME da mai bincike ya aiko kawai. Dole ne ta fara bincika tabbatarwa da izini, ta iyakance girman fayil a lokacin gudana, kuma ta duba ainihin nau'in fayil. Sabar ce za ta ƙirƙiri sabon sunan ajiya, kuma idan hoto ne za ta iya sake tsarawa ko ƙirƙirar ƙaramin hoto yadda ya dace. Idan wasu ba za su iya sauke fayilolin da aka loda ba, mayar da hanyar saukewa mai bukatar tabbatarwa maimakon URL.

| Abin da za a bincika a sabar | Dalili |
| --- | --- |
| Mai amfani da ya shiga da izinin loda | Hana amfani da wurin ajiyar wasu masu amfani |
| Girman fayil guda da dukan buƙata | Hana ƙarewar ƙwaƙwalwa da wurin ajiya |
| Ainihin MIME da tsawon da aka yarda | Tare fayil mai zartarwa da aka canza sunansa |
| Sunan ajiya bazuwar da ma'ajiyar rabuwa | Hana sarrafa hanya da maye gurbin fayil da yake akwai |
| Izinin samun URL na amsa da manufofin ƙarewa | Hana bayyanar fayil na sirri saboda URL kawai |

`extensions` da `maxFileSize` na abokin ciniki mataki ne na farko kawai don sanar da mai amfani da sauri. Dole ne ka sa irin wannan iyaka a sabar ma.

## Haɗa mai loda a mai bincike

Misalin da ke ƙasa shi ne ainihin haɗawar da NABI NOTE yake tsammani. Dalilin amfani da `XMLHttpRequest` shi ne `fetch()` na asali a mai bincike ba ya ba da ci gaban loda fayil. Idan kawai ka mayar da `url` da sabar ta amsa, hoto zai shiga tubalin hoto, sauran fayiloli kuma za su shiga mahaɗin abin da aka haɗa.

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
  { locale: 'ko' },
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
    request.addEventListener('error', () => reject(new Error('Buƙatar loda fayil ta kasa.')))
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
  locale: 'ko',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'ko' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'ko',
})
```

Dole ne ka haɗa `fileSink: upload.take` domin ja da saukewa da liƙa abin da fayiloli kawai suke ciki su shiga loda fayil. UI na wing ɗin `upload` yana miƙa maɓallin zaɓen fayil zuwa `upload.take()`. Yayin lodawa editan yana kulle, kuma fayilolin da suka yi nasara suna shiga da soke aiki sau ɗaya ga kowane batch. `upload.cancel()` ko maɓallin soke na `uploadView` suna katse buƙatar da ke gudana ta hanyar `AbortSignal`.

## Kuskure da cire allo

Idan sabar ta ba da amsar kuskure ko `uploader` ya mayar da `null`, ba a saka wannan fayil cikin daftari. Sauran fayiloli a batch iri ɗaya suna ci gaba da aiki. Idan an wuce iyakar dukan girma, batch ɗin gaba ɗaya ba zai fara ba. Lokacin rufe allo, cire haɗin a kishiyar tsarin ƙirƙira.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

A lokacin haɓakawa kawai za ka iya amfani da URL na `blob:` don ƙirƙirar samfoti nan da nan. A wannan yanayin, dole ne ka kunna `allowLocalUrls: true` a haɗawar edita, wing ɗin hoto, da wing ɗin loda bi da bi. Idan ainihin lodawa zuwa sabar tana mayar da URL na HTTPS, ya fi aminci kada ka kunna wannan zaɓi.

## Tsarin CSS

Ana nuna kammalallen fayil na yau da kullum da `a[data-nabi-file]` na wing ɗin mahaɗi. Domin canza kamannin abin da aka haɗa kawai a shafin wallafa, yi amfani da wannan zaɓaɓɓen.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

Sakamakon loda hoto yana bin CSS na wing ɗin hoto. Ana nuna ci gaban loda ne kawai a allon edita, saboda haka ba a bukatar ƙirƙirar yanayin ci gaba da CSS na shafin wallafa.
