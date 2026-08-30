---
title: Ambato
description: Yana haɗa zance ko wani mahalli dabam a cikin sakin layi da yawa.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Ambato

Yana haɗa zance ko wani mahalli dabam a cikin sakin layi da yawa. A sakin layi fanko, rubuta `>` sannan ka danna Space, ko ka sauya sakin layin da aka zaɓa zuwa ambato daga sandar kayan aiki.

A cikin ambato za ka iya saka ba sakin layi na yau da kullum kawai ba har ma da tubalai kamar jeri da hoto. Idan an sake sauya wannan kewayon, zai koma sakin layin waje.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## Tsarin CSS

Za ka iya canza iyaka da sarari na ambato da `.nabi-content blockquote`.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

Ka bar tsarin sakin layi a cikin `blockquote` yadda yake, kuma ka canza gabatarwa kawai kamar sararin waje, iyaka, da launi.
