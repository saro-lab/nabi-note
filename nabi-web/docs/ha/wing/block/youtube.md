---
title: YouTube
description: Yana saka bidiyon YouTube a daftari kuma yana daidaita faɗinsa.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

Yana karɓar adireshin bidiyon YouTube ko ID na bidiyo ya mai da shi tubalin sakawa. A cikin daftari ba a adana cikakken adireshi ba sai ID na bidiyo mai haruffa 11 da faɗi; sabon bidiyo yana farawa a tsakiya da faɗin 70%.

Ana zaɓar faɗi daga matakan da aka ƙayyade, kuma ana adana daidaitawa a sakin layin da ya kewaye bidiyon. A editan, dannawa na farko yana zaɓar bidiyo, sannan idan an sake dannawa bayan zaɓarsa za a iya kunna shi. Maimakon canza adireshin, share bidiyon ka saka sabo.

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## Tsarin CSS

Za ka iya canza iyaka da sasanninta na bidiyo da `.nabi-content iframe`. Kada ka canza faɗi da daidaitawar da aka adana.

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

`aspect-ratio`, faɗi, da margin na daidaitawa su ne fakitin ke amfani da su wajen kiyaye girman bidiyo, saboda haka kada ka sake rubuta su.
