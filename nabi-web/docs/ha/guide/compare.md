---
title: Kwatantawa
description: Kwatanta takardu biyu gefe da gefe, sannan a saka tsohon abun da aka zaɓa cikin takardar yanzu.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# Kwatantawa

Kwatanta takardu biyu da aka adana don ganin canje-canje. Ana buɗe kallon ba tare da edita ba; haɗa callback don saka tsohon abun da aka zaɓa cikin takardar yanzu.

## Saka tsohon abun da aka zaɓa

Hagu tsohuwar takarda ce, dama ta yanzu. Danna **&gt;&gt;** kusa da canji don amfani da tsohon abun sakin layi ko rukunin layukan. Ba zaɓen harafi-harafi ba ne. Ana iya dawo da abin da aka goge ko cire sabon abin da aka ƙara.

Gwada dawo da lokacin taro ko kayan da za a kawo kawai. Buɗe **Takardar yanzu da callback ya sabunta** don ganin sakamako. **Fara daga farko** yana dawo da misalin asali.

<CompareDemo />

## Kallon kwatantawa mai zaman kansa

Shigo daga `nabi-note/diff`. Ba `before` da `after` NABI TREE JSON da aka adana ko igiyoyin HTML. Gina registry da wing iri ɗaya da editan asali don karantawa da nuna tebura, jerin abubuwa, hotuna da sauran abun gaba ɗaya.

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'ha',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

Da farko ana nuna canje-canje da mahallinsu kawai. Maɓallin naɗewa yana buɗe cikakkun takardu; na baya/na gaba suna bin canje-canje. Idan babu canji, ana nuna duka. Ba tare da `onMerge` ba, karantawa kawai ake yi.

## Haɗa garwayawa ta dannawa da callback

Dannawa tana aika sakamakon da aka ba da shawara zuwa `onMerge`. Haɗa callback kawai ba ya adana takarda kai tsaye. Sabis dole ya amince da shawarar ya kira `update()` kafin kwatantawar ta canza.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'ha',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` NABI TREE JSON ne da canjin da aka zaɓa kawai. `before` da `after` su ne takardun lokacin dannawa; `changeId` na gane canji, `revision` na gane yanayin kwatantawa. Ba `update()` wannan `revision` a matsayin hujja ta uku: idan kwatantawa ta riga ta canza, yana dawo da `false` ba tare da amfani da shawarar ba.

Ana hana maimaita dannawa yayin jiran callback na asynchronous. Sabunta da wasu takardu ko cire kallo yana soke `signal`. Lokacin adanawa a uwar garke, duba siginar da sigar takardar don kada tsohon sakamako ya maye gurbin sabuwa.

## Buɗe kwatantawa daga edita

Haɗa wing `diff` da `mountDiffWing()` don buɗewa daga sandar kayan aiki. Tushe shi ne takardar da aka loda a ƙarshe. Gyara na yau da kullum da undo ba su canza tushen.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'ha',
  merge: true,
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

Da `merge: true`, ana saka tsohon abun da aka zaɓa cikin edita. Za a iya undo, tushe kuma ya kasance. Canjin editan asali yayin buɗe kallon yana sake lissafin kwatantawa. Barin `merge` yana riƙe karantawa kawai.

Kira `toolbar.unmount()` da `comparison.unmount()` lokacin cire kallo. Don haɗa sigar farkon gyara da garwaya bangarorin biyu kai tsaye, yi amfani da [Garwayawa](./merge).
