---
title: Nau'in rubutu
description: Yana amfani da rukunin nau'in rubutu ga haruffa ko sakin layin da aka zaɓa.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Nau'in rubutu

Yana amfani da rukunin nau'in rubutu ga haruffan da aka zaɓa. Idan ka zaɓi kewayo, yana canza wannan kewayon ne kawai; idan alama kawai take akwai, yana amfani da shi ga haruffan sakin layi na yanzu. Fayil ɗin font na ainihi da `font-family` CSS na sabis ne ke ƙayyade su.

Rukunin asali su ne `sans`, `serif`, `mono`, da `cursive`. Musamman ga sabis da ke ɗauke da Harshen Koriya, yana da kyau ka ƙayyade font ɗin da za a haɗa da kowane rukuni da kanka.

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

Idan ka bar `values`, ana amfani da duk rukunin asali. Ƙimomin da ke cikin `values` kawai ake yarda da su a cikin daftari.

## Tsarin CSS

Ana adana sunan rukuni kawai a cikin daftari, CSS kuma ke ƙayyade fayil ɗin font. Canza masu canji a ma'ajin iri ɗaya na edita da shafin wallafa.

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif KR", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

Idan kana amfani da font na yanar gizo, dole ne ka fara loda fayil ɗin font ɗin. Sau da yawa `cursive` ba ya da font da ke tallafa Harshen Koriya, saboda haka yana da kyau a fayyace font ɗin da sabis zai yi amfani da shi kafin a bayar da shi.
