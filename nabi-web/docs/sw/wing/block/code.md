---
title: Msimbo
description: Hifadhi msimbo wa mistari mingi pamoja na lugha inayotumiwa kuangazia sintaksia.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Msimbo

Ingiza msimbo wa mistari mingi kando na maandishi ya kawaida ya mwili. Andika alama tatu za nyuma katika aya tupu kisha ubonyeze Space au Enter, au badilisha hadi blokii ya msimbo kutoka kwenye upau wa zana. Ukiongeza jina la lugha baada ya alama hizo, kama `ts`, jina hilo huhifadhiwa pia.

Jina la lugha ni kitambulisho kinachotumiwa kuangazia sintaksia, na majina nje ya orodha iliyosajiliwa yanaweza pia kuandikwa mwenyewe. Kwa kuwa maudhui na ujongezaji wa msimbo lazima vihifadhiwe, blokii za msimbo hazikubali mpangilio wa aya.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## Kuunganisha Kiangazio cha Msimbo

Kusajili blokii ya msimbo hutumia upakaji rangi chaguomsingi ndani ya kihariri. Ili kupaka rangi msimbo katika mwonekano uliochapishwa pia, unganisha `nabi-note/viewer`. Kitazamaji hupata `pre > code` na husoma thamani ya `data-nabi-lang` ya elementi mzazi kama jina la lugha. Thamani hiyo ikikosekana, hukagua darasa la `language-...` kwenye elementi ya `code`.

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'en',
})

// Baada ya kubadilisha HTML iliyochapishwa
viewer.refresh()

// Unapofunga skrini
viewer.unmount()
```

Ikiwa hakuna kiangazio tofauti, au kiangazio hicho hakiwezi kushughulikia lugha, kitenganishi tokeni kilichojengwa ndani kisichohitaji utegemezi huipaka rangi badala yake. Span za tokeni zinazoingizwa na kiangazio zipo kwenye skrini pekee na haziandikwi tena kwenye JSON iliyohifadhiwa au HTML asili iliyochapishwa. `refresh()` na `unmount()` huondoa span hizo na kuunganisha tena kutoka kwenye msimbo asili wa sasa.

### Jinsi Tovuti ya NABI Inavyounganisha Shiki

Tovuti ya NABI hupakia kiangazio kwa nguvu ili Shiki isiingie kwenye skrini ya kwanza au kifurushi cha SSR. `loadCodeHighlighting()` katika `nabi-web/docs/.vitepress/src/highlight.ts` huunda kiini cha Shiki, kisha huchukua sarufi ya lugha tu wakati msimbo katika lugha hiyo unapohitajika kweli. Mfano hapa chini hutumia muunganisho huohuo katika mwonekano uliochapishwa.

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'en',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// Unapofunga skrini
stop?.()
viewer.unmount()
```

Lugha inapoonekana kwa mara ya kwanza, upakuaji wa sarufi huanza. Hadi wakati huo, blokii huonyeshwa kwa kitenganishi tokeni kilichojengwa ndani au kama maandishi ya kawaida. Sarufi ikifika, `onGrammarLoaded()` huita `viewer.refresh()` na kupaka blokii rangi tena. Kwa njia hiyo lugha zinazohitajika pekee hupakuliwa, na sarufi inayochelewa kufika hutumika bila kuhamia ukurasa mwingine.

Upande wa kihariri hutumia kitendakazi kilekile cha `highlight`. Onyesho la tovuti ya NABI hubadilisha `attach` chaguomsingi ya `codeWing` pekee kwa `makeCodeAttach({ highlight, version })`. `version` hubadilika kila sarufi inapofika, na hufanya kazi kama ishara ya kupaka tena msimbo ambao tayari umechorwa. Huduma huru inaweza kutekeleza muunganisho wa mwonekano uliochapishwa kwanza, kisha kuongeza mbinu hii ikiwa upakaji rangi wa Shiki unahitajika pia wakati wa kuhariri.

## Mitindo ya CSS

Tia mtindo kwenye blokii za msimbo kwa `.nabi-content pre`, na msimbo kwa `.nabi-content pre > code`. Usibadilishe `white-space`, kwa sababu huathiri uvunjaji wa mistari ya msimbo na uhariri. Rangi za tokeni zinaweza kubadilishwa kwa viteuzi vya `[data-nabi-token]`.

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
