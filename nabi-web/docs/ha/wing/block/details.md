---
title: Ninke
description: Yana haɗa taƙaitaccen bayani da abun ciki, kuma yana adana matsayin buɗewa na farko.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Ninke

Yana haɗa taƙaitaccen bayani da abun ciki a tubali ɗaya. Idan ka ƙirƙire shi daga sandar kayan aiki, ka fara da shigar da taƙaitaccen bayani sannan ka ci gaba da rubuta abun ciki a ƙasa.

Yanayin buɗewa da aka saita da alamar alwatika yana ajiyuwa cikin takarda, ya zama yanayin farko a shafin da aka wallafa. Yayin gyara ma za ka iya danna alwatikar don buɗewa da rufe toshe.

A cikin sel ko wani toshe, toshen ninkewa da abin ya shafa ne kawai yake buɗewa ko rufewa. Idan siginar rubutu ko zaɓi yana cikin abin da ake rufewa, za a fitar da shi waje; zaɓin da yake wani wuri yana nan yadda yake.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## Tsarin CSS

Za ka iya yi wa tubalin ninkewa ado da `.nabi-content details`, take kuma da `.nabi-content details > summary`.

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

Sifar `open` ita ce matsayin buɗewa na farko da marubuci ya adana. CSS na iya yi wa wannan matsayi ado, amma yana da kyau kada ya canza matsayin da karfi.
