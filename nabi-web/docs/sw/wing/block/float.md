---
title: Eneo linaloelea
description: Weka maandishi, picha na majedwali kando ya maandishi makuu ili aya zinazofuata zitiririke pembeni yake.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Eneo linaloelea

Weka maelezo mafupi, picha au jedwali dogo kushoto au kulia na uache maandishi makuu yatiririke pembeni yake. Unaweza kuhariri maudhui ya eneo moja kwa moja katika kihariri hicho hicho. Mpaka wa mistari iliyokatika huonekana wakati wa kuhariri tu; hakikisho na mwonekano uliochapishwa huonyesha maudhui na mpangilio pekee.

Weka kishale ndani ya eneo kwenye mfano ulio hapa chini na utumie zana za sifa kubadilisha upande na upana wa juu zaidi. Katika hakikisho, utaona maandishi yakitiririka bila mpaka wa mistari iliyokatika.

<WingDemo path="/wing/block/float" />

```ts
const selected = wings().allBasic().build()
```

Maeneo yanayoelea yamejumuishwa katika mabawa ya msingi. Ukiunganisha mabawa unayohitaji pekee, tumia `wings().use('float')` au sajili `floatWing` moja kwa moja. Sajili pia mabawa ya picha, majedwali, orodha na maudhui mengine yatakayotumika ndani ya eneo.

## Kuunda na kuweka

Weka kishale katika maandishi makuu na ubofye **Eneo linaloelea** ili kuunda eneo tupu. Chaguomsingi ni upande wa kulia na upana wa juu zaidi wa 40%. Ukichagua aya kadhaa kabla ya kubofya, aya zote zilizoguswa na uteuzi huwekwa kikamilifu ndani ya eneo moja. Huwezi kufunika tena eneo linaloelea lililopo au kuunda eneo jingine linaloelea ndani yake.

```ts
nabi.applyCommand('insertFloat', { side: 'right', w: 40 })
```

Kishale kikiwa ndani ya eneo, tumia zana za sifa kubadilisha upande wa kushoto au kulia na upana wa juu zaidi. Chagua 20%, 30%, 40% au 50%. Thamani hutegemea upana wa maandishi makuu, si skrini nzima; maudhui mafupi yanaweza kufanya eneo halisi liwe jembamba zaidi.

```ts
nabi.applyCommand('setFloatSide', { side: 'left' })
nabi.applyCommand('setFloatWidth', { w: 30 })
```

Kubandika maandishi, picha na majedwali, kubadilisha aina ya bloku na kupakia hubaki ndani ya eneo. Kufuta jedwali la ndani huondoa jedwali hilo pekee. Huwezi kuingiza au kubadilisha bloku za ndani ikiwa uteuzi unajumuisha ndani na nje ya eneo kwa pamoja.

Kitufe **Ondoa eneo linaloelea** karibu na thamani ya upana hurudisha maudhui katika maandishi makuu bila kuyafuta. Kuunda, kubadilisha mpangilio na kuondoa kifuniko vyote vinaweza kutenduliwa na kufanywa upya.

```ts
nabi.applyCommand('unwrapFloat')
```

## Jinsi maandishi yanavyotiririka pembeni

Aya zinazofuata hutiririka kando ya eneo na kurudi kwenye upana mzima wa maandishi makuu eneo linapoisha. Kichwa, jedwali, bloku ya msimbo, kitenganishi au eneo jipya linaloelea linalofuata huanza chini ya eneo lililotangulia.

Upana wa maandishi makuu ukiwa chini ya `36rem`, eneo na maandishi hupangwa katika safu moja. Uchapishaji pia hutumia safu moja huku ukihifadhi upande na upana wa juu zaidi uliowekwa. Mwonekano wa kulinganisha hati huhifadhi upande na upana wa juu zaidi wa kila eneo, lakini huonyesha bloku inayofuata kando chini yake ili kurahisisha kusoma mabadiliko.

## Kuhifadhi na kupakia

JSON huhifadhi `a.side` na `a.w` za nodi `float` pamoja na bloku zake za ndani. HTML hutumia sifa `data-nabi-float` na `data-nabi-float-width` kwenye `div` ndani ya aya ya kitu ya kawaida.

```html
<div data-nabi-p>
  <div data-nabi-float="right" data-nabi-float-width="40">
    <p>Maelezo ya kuweka kando ya maandishi makuu.</p>
  </div>
</div>
<p>Aya hii inaendelea kando ya eneo.</p>
```

Utoaji wa Markdown huhifadhi eneo kama HTML. Mitindo yoyote ya CSS `float` haiingizwi, kwa hiyo tumia JSON au HTML iliyotengenezwa na NABI NOTE kuhifadhi na kurejesha. Unganisha mabawa na CSS zilezile katika kihariri, SSR, hakikisho na mwonekano uliochapishwa ili kuhifadhi upande na upana.

## Mitindo ya CSS

Unaweza kupamba rangi na nafasi ndani ya eneo kwa kiteuzi `[data-nabi-float]`. Aya ya nje hudhibiti mpangilio na upana wa juu zaidi, kwa hiyo usibadilishe moja kwa moja `float`, `display` au upana.

```css
.brand-note .nabi-content [data-nabi-float] {
  background: var(--nabi-soft);
  border-radius: var(--nabi-radius);
  padding: .75rem;
}
```
