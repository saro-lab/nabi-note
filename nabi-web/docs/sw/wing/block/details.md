---
title: Maelezo
description: Kusanya muhtasari na mwili, na hifadhi ikiwa inaanza ikiwa wazi.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Maelezo

Kusanya muhtasari mfupi na mwili katika blokii moja. Unapoiunda kutoka kwenye upau wa zana, unaingiza muhtasari kwanza kisha unaendelea kuandika maudhui chini yake.

Hali ya kufunguka iliyowekwa kwa pembetatu huhifadhiwa kwenye hati na kuwa hali ya mwanzo katika mwonekano uliochapishwa. Wakati wa kuhariri pia unaweza kubofya pembetatu kufungua na kufunga kizuizi.

Ndani ya seli au kizuizi kingine, ni kizuizi hicho cha kukunja pekee kinachofunguka au kufungwa. Kishale au uteuzi ukiwa ndani ya maudhui yanayofungwa, huhamishwa nje; uteuzi ulio sehemu nyingine huhifadhiwa.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## Mitindo ya CSS

Tia mtindo kwenye blokii ya maelezo kwa `.nabi-content details`, na kichwa kwa `.nabi-content details > summary`.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

Sifa ya `open` ni hali ya mwanzo ya kufunguka iliyohifadhiwa na mwandishi. CSS inaweza kutia mtindo kwenye hali hii, lakini ni bora kutoilazimisha hali yenyewe.
