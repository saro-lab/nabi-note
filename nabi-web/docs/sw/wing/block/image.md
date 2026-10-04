---
title: Picha
description: Weka URL ya picha na urekebishe upana na mpangilio.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Picha

Weka URL ya picha na urekebishe upana na mpangilio wake. Kwa chaguomsingi, anwani huzuiwa kwa `http:`, `https:`, au njia za tovuti hiyo hiyo, na picha mpya huanza ikiwa katikati kwa upana wa 60%.

Upana huhifadhiwa katika hatua zisizobadilika pekee, na mpangilio huhifadhiwa kwenye aya inayofunga picha. Ili kutumia onyesho la awali la `blob:` au `data:image/...`, ruhusu URL za ndani waziwazi katika wing ya picha na uundaji wa kihariri. URL za data za SVG haziruhusiwi.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

Wing hii huingiza anwani kwenye hati; haipakii faili. Ili kutuma faili kwenye seva, unganisha [wing ya kupakia](/sw/wing/etc/upload).

## Kuunganisha kichaguzi cha picha

Tumia `panels.img` katika `mountToolbar()` kubadilisha dirisha la kawaida la kuingiza URL la kitufe cha picha kwa kichaguzi cha picha cha huduma yako. Funguo ni majina ya nafasi za upau wa zana; zana ambazo hazijatajwa zinaendelea kutumia madirisha yake ya kawaida.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: ({ root, signal, run }) =>
      mountMyImagePicker(root, {
        signal,
        onSelect: (url: string) => run('insertImage', { src: url }),
      }),
  },
})
```

`mountMyImagePicker` ni chaguo la kukokotoa unalotekeleza katika huduma yako. Linaunda UI yako kwa ulandanishi ndani ya `root` iliyotolewa na kurudisha chaguo la kukokotoa la kusafisha. Unganisha `signal` na kazi zisizolandanishwa kama kupakia orodha ya picha au kutuma faili, kisha pitisha URL ya picha iliyochaguliwa kwa `onSelect`. API hii haitumi faili; sheria zilizopo za kuruhusu URL za picha bado zinatumika.

Kufunga dirisha au kuondoa upau wa zana kunakatisha `signal` na kuita chaguo la kukokotoa la kusafisha. `run()` inafunga dirisha na kutumia amri mara moja kwenye uteuzi uliohifadhiwa wakati wa kufungua. Ikiwa dirisha tayari limefungwa au maudhui ya hati yamebadilika tangu kufunguliwa, inarudisha `false` bila kutekeleza amri.

## Mitindo ya CSS

Tia mtindo kwenye picha kwa `.nabi-content img`. Dumisha upana na mpangilio uliohifadhiwa, na ubadilishe maelezo ya mwonekano pekee kama mipaka au vivuli.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

Hifadhi kanuni chaguomsingi za `max-inline-size`, `block-size`, upana na mpangilio. Ukubwa wa picha huhifadhiwa katika hati, hivyo kulazimisha upana wa CSS usiobadilika kunaweza kugongana na upana uliochaguliwa na mwandishi.
