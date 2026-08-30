---
title: Hoto
description: Yana saka adireshin hoto kuma yana daidaita faɗi da matsayi.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Hoto

Yana saka adireshin hoto kuma yana daidaita faɗi da matsayi. Ta asali ana yarda da `http:`, `https:`, ko hanyar shafin iri ɗaya kawai; sabon hoto yana farawa a tsakiya da faɗin 60%.

Ana adana faɗi ne kawai a cikin matakan da aka ƙayyade, kuma ana adana daidaitawa a sakin layin da ya kewaye hoton. Don amfani da samfotin `blob:` da `data:image/...`, dole ne ka yarda da URL na gida a bayyane a wing ɗin hoto da haɗawar edita bi da bi. Ba a yarda da URL ɗin bayanan SVG ba.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

Wannan wing yana saka adireshi a cikin daftari kawai; ba ya aika fayil. Domin tura fayil zuwa sabar, haɗa [wing ɗin loda fayil](/ha/wing/etc/upload).

## Tsarin CSS

Ana yi wa hoto ado da `.nabi-content img`. Ka bar faɗi da daidaitawar da aka adana yadda suke, kuma ka canza kamanni kawai, kamar iyaka ko inuwa.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

Ka bar dokokin asali game da `max-inline-size`, `block-size`, faɗi, da daidaitawa. Girman hoto ƙima ce da aka adana a daftari; idan CSS ya tilasta masa ƙima kafaffe, zai iya saɓa da faɗin da marubuci ya zaɓa.
