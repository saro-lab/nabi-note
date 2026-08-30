---
title: YouTube
description: Pachika video ya YouTube kwenye hati na urekebishe upana wake.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

Kubali URL ya video ya YouTube au kitambulisho cha video na ukigeuze kuwa blokii iliyopachikwa. Hati huhifadhi kitambulisho cha video chenye herufi 11 na upana pekee, si URL kamili, na video mpya huanza ikiwa katikati kwa upana wa 70%.

Upana huchaguliwa kutoka hatua zisizobadilika, na mpangilio huhifadhiwa kwenye aya inayofunga video. Katika kihariri, mbofyo wa kwanza huchagua video; ikishachaguliwa, kubofya tena kunaweza kuicheza. Ili kubadilisha anwani, futa video na uingize mpya.

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## Mitindo ya CSS

Tumia `.nabi-content iframe` kubadilisha mpaka au pembe za video. Usibadilishe upana au mpangilio uliohifadhiwa.

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

Kifurushi hutumia `aspect-ratio`, upana na pambizo za mpangilio ili kudumisha ukubwa sahihi wa video, kwa hiyo usizibadilishe.
