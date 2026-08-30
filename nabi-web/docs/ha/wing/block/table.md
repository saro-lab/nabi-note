---
title: Tebur
description: Yana ƙirƙirar layuka da ginshiƙai, kuma yana goyon bayan gyaran tantanin halitta da jerin ginshiƙi.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tebur

Zaɓi layuka da ginshiƙai daga sandar kayan aiki don ƙirƙirar tebur. A cikin tantanin halitta, rubuta abun ciki a ci gaba da tsalle layi maimakon sakin layi da yawa, kuma yi amfani da Tab da Shift+Tab don matsawa zuwa tantani na gaba ko na baya.

Ƙarawa ko share layuka da ginshiƙai, haɗa tantanai, da sauya tantanin take suna aiki bisa tantanin da aka zaɓa. Bayan ka adana tebur mai iya a daidaita, dole ne ka haɗa `attachViewer()` na `nabi-note/viewer` don amfani da daidaita ginshiƙi a shafin da aka wallafa. Tebur mai tantanin da aka haɗa ba ya cikin abin da za a iya daidaitawa ta ginshiƙi.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## Tsarin CSS

Ana yi wa tebur ado da `.nabi-content table`, tantani kuma da `.nabi-content :is(th, td)`. Kada ka canza tsarin tantani ko maɓallan daidaitawa da viewer ya saka.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

Idan ka haɗa viewer, ka bar maɓallin `.nabi-sort` yadda yake. Tilasta sake rubuta `position` ko padding na dama a tantani na iya sa ya yi karo da maɓallin daidaitawa.
