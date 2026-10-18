---
title: Kuunganisha
description: Unganisha toleo la mwanzo, toleo lako na lililohifadhiwa wakati huo, kisha hariri migongano iliyobaki kuitatua.
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# Kuunganisha

Mabadiliko mengine yakihifadhiwa ulipokuwa ukihariri, unganisha pande zote kwa kutumia toleo la mwanzo kama msingi. Yanayoweza kuunganishwa kiotomatiki hutumika mara moja; yanayopishana tu hubaki migongano. Huu ni mwonekano unaojitegemea wa `nabi-note/merge`, si wing.

| Kushoto | Katikati | Kulia |
| --- | --- | --- |
| Toleo la mwanzo wa uhariri | Hati yako ya sasa baada ya uunganishaji otomatiki | Toleo lililohifadhiwa ulipokuwa ukihariri |
| Kusoma tu | Kuhariri moja kwa moja | Kusoma tu |

Katikati hariri maandishi, uumbizaji, jedwali, orodha na picha kama kihariri cha kawaida. Wing ulizotoa huamua vipengele. Alama za migongano na hali ya utatuzi haziingii katika maudhui yaliyohifadhiwa.

## Mfano wa kuunganisha yote kiotomatiki

Ulibadili muda wa mkutano kuwa **11:00 asubuhi**, mtu mwingine akabadilisha mahali kuwa **chumba cha mikutano cha ghorofa ya 3**. Aya ni tofauti, hivyo matokeo ya katikati yana mabadiliko yote mawili.

Bila migongano iliyobaki, unaweza kubofya **Thibitisha** mara moja au kuboresha maandishi ya katikati kwanza. Hati ya mwisho hapa chini ni matokeo halisi yaliyopokelewa na callback ya uthibitisho.

<MergeDemo />

## Mfano wa kuunganisha sehemu kiotomatiki

Sasa ulibadili muda kuwa **11:00 asubuhi**, mwingine kuwa **14:00 alasiri**. Mabadiliko tofauti ya aya moja huacha mgongano wa muda. Ubadilishaji wako wa waongozaji kuwa **Jimin na Seoyeon** na mahali kuwa **chumba cha mikutano cha ghorofa ya 3** hutumika kiotomatiki.

Tatua mgongano kwa mojawapo ya hizi:

- Kushoto **&gt;&gt;**: tumia maudhui husika ya toleo la mwanzo.
- Kulia **&lt;&lt;**: tumia maudhui husika ya toleo jipya lililohifadhiwa.
- **Tatua kwa maudhui ya sasa**: acha au hariri katikati, kisha tia alama ya kutatuliwa.

Badili sentensi ya muda katikati na ubofye **Tatua kwa maudhui ya sasa**. Uthibitisho unapatikana migongano yote ikitatuliwa.

<MergeDemo partial />

Kuhariri tena eneo lililotatuliwa huhifadhi hali yake. Kutengua utatuzi hutengua hali pia; kurudia huirejesha. Kufuta au kuhariri maandishi pekee hakutatui mgongano ulio wazi kiotomatiki.

## Kanuni za uunganishaji otomatiki na migongano

Linganisha mabadiliko kutoka hati ya mwanzo kwenda yako na kutoka mwanzo huohuo kwenda toleo jipya. Mabadiliko ya upande mmoja na yanayofanana pande zote hutumika kiotomatiki, pamoja na mabadiliko ya aya au mistari tofauti.

Kama uunganishaji wa maandishi wa Git, mwingiliano huamuliwa kwa aya na mistari. Hata maneno tofauti yaliyobadilishwa katika mstari mmoja hubaki mgongano. Uingizaji tofauti katika nafasi moja au kuhariri kilichofutwa na upande mwingine huhitaji uamuzi pia.

Pande zote zikibadili tofauti blok yenye muundo kama jedwali, orodha au eneo la kuelea, muundo wote huwa mgongano. Seli na vipengee havichanganywi kiholela: chagua maudhui au hariri katikati. Uhamishaji na uhariri unaopishana wenye nafasi isiyo hakika hautumiki kiotomatiki pia.

## Kuunganisha mwonekano unaojitegemea

Toa NABI TREE JSON iliyohifadhiwa au mifuatano ya HTML kwa `base`, `local`, `incoming`. Tumia wing na chaguo za kihariri cha asili. `mountMerge()` hutengeneza kihariri cha kati, upau, vyanzo viwili, zana za migongano na kitufe cha kuthibitisha.

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
  locale: 'sw',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` hupokea JSON, HTML ya kuchapisha, revision ya uhariri na `incomingVersion` ya matokeo ya sasa yaliyotatuliwa yote. Kurudisha `false` hakukamilishi uthibitisho. Promise ikisubiri, uhariri, uchaguzi wa migongano na uthibitisho unaorudiwa huzuiwa. Kuondoa mwonekano hukatiza `signal` ya matokeo. Utungaji wa IME wa Kikorea lazima ukamilike kabla ya kuthibitisha.

Unganisha vitendo vya huduma kama kichagua picha au upakiaji kama kihariri cha kawaida. `toolbarOptions` hupokea paneli na vitendo vya host; `surfaceOptions` chaguo za eneo la uhariri.

`incomingVersion` hurudisha thamani ya huduma bila kubadili. Huduma lazima ilinganishe na toleo la karibuni la seva wakati wa kuhifadhi. Toleo jingine likihifadhiwa wakati wa kuunganisha, pata hati mpya na anza uunganishaji mpya badala ya kuandika matokeo ya zamani juu yake.

Unaweza kusoma hali au kuthibitisha kutoka nje ya mwonekano pia.

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

Soma matokeo kwa `merge.nabi.getJson()` na `merge.nabi.getHtml()`. Usihifadhi DOM ya uhariri au `getEditorHtml()`. Kutumia maudhui ya zamani yaliyochaguliwa pekee kati ya matoleo mawili, tumia uunganishaji wa kubofya katika [Ulinganisho](./compare).

## Kuthibitisha baada ya upakiaji

Unganisha wing `upload` na `mountUpload()` kwa kitufe cha faili, kubandika na kuburuta na kuachia. `sendUpload` hutuma faili seva na kurudisha `{ uri }`. Tazama [Upakiaji wa faili](../wing/etc/upload) kwa mfano kamili wa muunganisho na maendeleo.

Tumia `merge.session.hold()` kuahirisha uthibitisho na uchaguzi wa migongano wakati kazi isiyosawazishwa kama upakiaji haijaingia kwenye hati. Ita kitendakazi kilichorudishwa unapomaliza, kughairi au kuondoa mwonekano. Achia **baada ya kuingiza kwenye hati**, si mara tu baada ya kupakia seva, ili faili iingie kwenye matokeo ya mwisho.

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
  locale: 'sw',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'sw',
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

`merge.content` ni DOM ya kati ya uhariri; `merge.surface` na `merge.toolbar` tayari zimeunganishwa. Usiunde eneo au upau mwingine hapo. Ondoa mount za ziada za upakiaji na maendeleo kwanza, kisha ita `merge.unmount()`.
