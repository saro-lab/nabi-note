---
title: Ulinganisho
description: Linganisha hati mbili kando kwa kando na utumie maudhui ya zamani yaliyochaguliwa katika hati ya sasa.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# Ulinganisho

Weka hati mbili zilizohifadhiwa kando kwa kando kuona mabadiliko. Mwonekano unaweza kufunguka bila kihariri; unganisha callback kutumia maudhui ya zamani yaliyochaguliwa katika hati ya sasa.

## Kutumia maudhui ya zamani yaliyochaguliwa

Ulinganisho wa kujitegemea ni wa kusoma tu kwa chaguomsingi na hauonyeshi vitufe vya kutumia **&gt;&gt;**. Unganisha callback ya `onMerge` ili kuonyesha vitufe hivyo.

Kushoto ni hati ya zamani, kulia hati ya sasa. Bonyeza **&gt;&gt;** karibu na badiliko kutumia maudhui ya zamani ya aya au kundi hilo la mistari. Uchaguzi si herufi moja moja. Unaweza pia kurejesha maudhui yaliyofutwa au kuondoa yaliyoongezwa katika hati ya sasa.

Mfano ulio hapa chini ni wa kusoma tu. Angalia jinsi muda wa mkutano na vitu vya kuleta vilivyobadilika. **Anza upya** hurejesha mfano wa asili.

<CompareDemo />

## Ulinganisho unaojitegemea

Leta kutoka `nabi-note/diff`. Weka NABI TREE JSON iliyohifadhiwa au mifuatano ya HTML katika `before` na `after`. Tengeneza registry kwa wing zilezile za kihariri cha asili ili jedwali, orodha, picha na maudhui mengine yasomwe na kuonyeshwa kikamilifu.

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
  locale: 'sw',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

Kwa kawaida huonekana mabadiliko na muktadha wake tu. Kitufe cha kukunja hufungua hati nzima; vilivyotangulia/vinavyofuata hupitia mabadiliko. Bila mabadiliko, hati nzima huonekana. Bila `onMerge`, ulinganisho ni wa kusoma tu.

## Kuunganisha uunganishaji wa kubofya kwa callback

Kubofya hutuma pendekezo la matokeo kwa `onMerge`. Kuunganisha callback pekee hakuhifadhi hati kiotomatiki. Huduma lazima ikubali pendekezo na kuita `update()` ili ulinganisho ubadilike.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'sw',
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

`proposal.result` ni NABI TREE JSON yenye badiliko lililochaguliwa pekee. `before` na `after` ni hati wakati wa kubofya; `changeId` hutambulisha badiliko, `revision` hali ya ulinganisho. Pitisha `revision` hii kama hoja ya tatu ya `update()`: ulinganisho ukiwa umebadilika, hurudisha `false` bila kutumia pendekezo.

Mibofyo inayorudiwa huzuiwa callback isiyosawazishwa ikisubiri. Kusasisha kwa hati nyingine au kuondoa mwonekano hukatiza `signal`. Unapohifadhi seva, kagua ishara na toleo la hati la seva ili matokeo ya zamani yasiandike juu ya hati mpya.

## Kufungua ulinganisho kutoka kihariri

Unganisha wing `diff` na `mountDiffWing()` kufungua ulinganisho kwenye upau wa zana. Msingi ni hati iliyopakiwa mwisho. Uhariri wa kawaida na kutengua havibadili msingi.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'sw',
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

`merge` ni `true` kwa chaguomsingi, kwa hiyo maudhui ya awali yaliyochaguliwa yanaweza kutumika kwenye kihariri. Mabadiliko yanaweza kutenguliwa na hati ya msingi huhifadhiwa. Kihariri cha asili kikibadilika wakati ulinganisho uko wazi, ulinganisho huhesabiwa upya. Weka `merge: false` kwa ulinganisho wa kusoma tu.

Ita `toolbar.unmount()` na `comparison.unmount()` unapoondoa mwonekano. Kujumuisha toleo la mwanzo wa uhariri na kuunganisha pande zote kiotomatiki, tumia [Kuunganisha](./merge).
