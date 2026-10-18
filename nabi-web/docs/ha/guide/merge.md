---
title: Garwayawa
description: Haɗa sigar farkon gyara, taku da wadda aka adana a lokacin, sannan gyara rikice-rikicen da suka rage.
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# Garwayawa

Idan an adana wasu canje-canje yayin gyaranku, haɗa bangarorin biyu bisa sigar farko. Duk abin da za a iya garwayawa kai tsaye yana shiga tun farko; masu haɗuwa ne kawai suke zama rikici. Wannan kallo ne mai zaman kansa na `nabi-note/merge`, ba wing ba.

| Hagu | Tsakiya | Dama |
| --- | --- | --- |
| Sigar lokacin fara gyara | Takardarku ta yanzu bayan garwayawa kai tsaye | Sigar da aka adana yayin gyaranku |
| Karantawa kawai | Ana gyarawa kai tsaye | Karantawa kawai |

A tsakiya ana gyara rubutu, tsari, tebura, jerin abubuwa da hotuna kamar edita na yau da kullum. Wing da aka bayar sukan ƙayyade ayyuka. Alamun rikici da matsayin warwarewa ba su shiga abun da ake adanawa.

## Misalin garwayawa gaba ɗaya kai tsaye

Kun canza lokacin taro zuwa **11:00 na safe**, wani ya canza wuri zuwa **ɗakin taro na hawa na 3**. Sakin layi daban-daban ne, don haka sakamakon tsakiya yana ɗauke da canje-canjen biyu.

Babu rikici da ya rage, za ku iya danna **Tabbatar** yanzu ko fara inganta rubutun tsakiya. Takardar ƙarshe a ƙasa ita ce ainihin sakamakon da callback na tabbatarwa ya karɓa.

<MergeDemo />

## Misalin garwayawa a wani ɓangare kai tsaye

Yanzu kun canza lokaci zuwa **11:00 na safe**, wani zuwa **14:00 na rana**. Canje-canje dabam a sakin layi ɗaya suna barin lokaci cikin rikici. Sauya masu jagoranci zuwa **Jimin da Seoyeon** da wurin zuwa **ɗakin taro na hawa na 3** suna shiga kai tsaye.

Warware rikici da ɗaya daga waɗannan:

- Hagu **&gt;&gt;**: ɗauki abun da ya dace daga sigar farko.
- Dama **&lt;&lt;**: ɗauki abun da ya dace daga sabuwar sigar da aka adana.
- **Warware da abin da ke ciki yanzu**: bar ko gyara tsakiya sannan alama cewa an warware.

Canza jumlar lokaci a tsakiya, danna **Warware da abin da ke ciki yanzu**. Ana tabbatarwa ne bayan duk rikice-rikice sun warware.

<MergeDemo partial />

Sake gyara yankin da aka warware yana riƙe matsayinsa. Undo na warwarewa yana janye matsayin ma; redo yana dawo da shi. Gogewa ko gyara rubutu kaɗai ba ya warware rikicin da ke buɗe kai tsaye.

## Ka'idojin garwayawa kai tsaye da rikici

Ana kwatanta canje-canje daga takardar farko zuwa taku da daga wannan farko zuwa sabuwar siga. Canjin ɓangare ɗaya da iri ɗaya a bangarorin biyu suna shiga kai tsaye, haka ma canje-canjen sakin layi ko layuka daban.

Kamar garwayar rubutu ta Git, ana gano haɗuwa bisa sakin layi da layuka. Ko kalmomi daban da aka canza a layi ɗaya suna zama rikici. Saka abubuwa daban a wuri ɗaya ko gyara abin da ɗayan ya goge ma yana buƙatar shawara.

Idan bangarorin biyu sun gyara tubali mai tsari kamar tebur, jeri ko yankin float dabam, tsarin gaba ɗaya yana zama rikici. Ba a cakuda sel ko abubuwan jeri barkatai: zaɓi abun ko gyara tsakiya. Motsi da gyara masu haɗuwa waɗanda ba a tabbatar da wurinsu ba su ma ba sa shiga kai tsaye.

## Haɗa kallon garwayawa mai zaman kansa

Ba `base`, `local`, `incoming` NABI TREE JSON da aka adana ko igiyoyin HTML. Yi amfani da wing da zaɓuɓɓukan editan asali. `mountMerge()` yana gina editan tsakiya, sanda, tushen biyu, kayan zaɓen rikici da maɓallin tabbatarwa.

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'ha',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` yana karɓar JSON, HTML na wallafawa, revision na gyara da `incomingVersion` na sakamakon yanzu da aka warware gaba ɗaya. Mayar da `false` ba ya kammala tabbatarwa. Yayin jiran Promise, ana hana gyara, zaɓen rikici da maimaita tabbatarwa. Cire kallo yana soke `signal` na sakamakon. Dole haɗa haruffan IME na Koriya ya ƙare kafin tabbatarwa.

Haɗa ayyukan sabis kamar zaɓen hoto ko lodawa kamar edita na yau da kullum. `toolbarOptions` yana karɓar bangarorin sanda da ayyukan host; `surfaceOptions` zaɓuɓɓukan farfajiyar gyara.

`incomingVersion` yana dawo da ƙimar sabis ba tare da canji ba. Sabis ya kwatanta ta da sabuwar sigar uwar garke lokacin adanawa. Idan an adana wata siga yayin garwayawa, ɗauko sabuwar takarda a fara sabon garwayawa, kada tsohon sakamako ya maye gurbinta.

Ana iya karanta yanayi ko kiran tabbatarwa daga wajen kallon ma.

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

Karanta sakamako da `merge.nabi.getJson()` da `merge.nabi.getHtml()`. Kada a adana DOM na gyara ko `getEditorHtml()`. Don amfani da tsohon abun da aka zaɓa kawai tsakanin sigogi biyu, yi garwaya ta dannawa a [Kwatantawa](./compare).

## Tabbatar bayan lodawa

Haɗa wing `upload` da `mountUpload()` don maɓallin fayil, manna da ja a saki. `sendUpload` yana aika fayiloli uwar garke ya dawo da `{ uri }`. Duba [Loda fayil](../wing/etc/upload) don cikakken misalin haɗawa da ci gaba.

Yi amfani da `merge.session.hold()` don jinkirta tabbatarwa da zaɓen rikici yayin aikin asynchronous kamar lodawa bai shiga takarda ba. Kira aikin da aka dawo da shi lokacin kammalawa, sokewa ko cire kallo. Saki **bayan an saka cikin takarda**, ba nan da nan bayan lodawa uwar garke ba, domin fayil ya shiga sakamakon ƙarshe.

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'ha',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'ha',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` DOM na gyaran tsakiya ne; `merge.surface` da `merge.toolbar` an riga an haɗa su. Kada a gina wata farfajiya ko sanda a wurin. Cire mount na lodawa da ci gaba da aka ƙara tukuna, sannan kira `merge.unmount()`.
