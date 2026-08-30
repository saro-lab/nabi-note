---
title: Jedwali
description: Unda safu mlalo na safu wima, hariri seli, na usaidie upangaji wa safu wima.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Jedwali

Chagua safu mlalo na safu wima kutoka kwenye upau wa zana ili kuunda jedwali. Ndani ya seli, maudhui huendelea kwa kuvunja mistari badala ya aya nyingi, na Tab na Shift+Tab husogea hadi seli inayofuata au iliyotangulia.

Kuongeza na kufuta safu mlalo au safu wima, kuunganisha seli, na kuwasha au kuzima seli za kichwa hufanya kazi kuzunguka seli zilizochaguliwa. Ili kutumia upangaji wa safu wima kwenye mwonekano uliochapishwa baada ya kuhifadhi jedwali kama linaloweza kupangwa, unganisha `attachViewer()` kutoka `nabi-note/viewer`. Majedwali yenye seli zilizounganishwa hayapangwi.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## Mitindo ya CSS

Tia mtindo kwenye jedwali kwa `.nabi-content table`, na seli kwa `.nabi-content :is(th, td)`. Usibadilishe muundo wa seli au kitufe cha kupanga kinachoingizwa na kitazamaji.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

Kitazamaji kikiunganishwa, hifadhi kitufe cha `.nabi-sort`. Ukibatilisha kwa lazima `position` ya seli au nafasi ya kulia, kinaweza kufunika kitufe cha kupanga.
