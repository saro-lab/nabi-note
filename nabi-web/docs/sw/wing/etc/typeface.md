---
title: Aina ya Herufi
description: Tumia familia ya aina ya herufi kwenye maandishi yaliyochaguliwa au aya.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Aina ya Herufi

Tumia familia ya aina ya herufi kwenye maandishi yaliyochaguliwa. Eneo likichaguliwa, eneo hilo pekee hubadilika; ikiwa kuna kielekezi pekee, hutumika kwa maandishi katika aya ya sasa. Faili halisi za fonti na thamani za `font-family` hufafanuliwa na CSS ya huduma.

Familia chaguomsingi ni `sans`, `serif`, `mono`, na `cursive`. Hasa katika huduma zinazojumuisha Kikorea au maudhui mengine ya lugha nyingi, ni bora kuamua wazi fonti ambazo kila familia itatumia.

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

Iwapo `values` itaachwa, familia zote chaguomsingi hutumika. Thamani zilizojumuishwa katika `values` pekee ndizo zinazoruhusiwa kwenye hati.

## Mitindo ya CSS

Hati huhifadhi jina la familia pekee, na CSS huchagua faili za fonti. Badilisha vigeu kwenye kontena lilelile kwa kihariri na mwonekano uliochapishwa.

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif", "Noto Serif KR", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

Ukitumia fonti za wavuti, pakia faili hizo za fonti kwanza. `cursive` mara nyingi haina ufunikaji mzuri wa lugha nyingi, kwa hiyo ni bora kuitoa baada ya kuchagua fonti halisi ambayo huduma yako itatumia.
