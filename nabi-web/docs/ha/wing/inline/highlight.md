---
title: Alamar haske
description: Sanya launin alamar haske da aka yarda da shi a bayan rubutun da aka zaɓa.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Alamar haske

Sanya launin alamar haske a bayan rubutun da aka zaɓa. Bayanai da ake adanawa suna ɗauke da sunan launi da aka yarda da shi kawai, ba kowace ƙimar launin CSS ba; saboda haka salon gani da bayanan takarda suna rabuwa.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

Idan aka bar `values`, rumbun tsoho shi ne `yellow`, `green`, `cyan`, `pink`, `purple`, da `orange`. Idan aka rage jerin, launin da ba ya ciki ba zai tsaya ba ko da an buɗe tsohuwar takarda.

## Salon CSS

Takarda tana adana sunan launi kawai. Canja launin editan da shafin da aka buga ta masu canjin CSS.

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

Idan an canja launuka da yawa tare, sunayen launin takarda za su tsaya yadda suke yayin da yanayin samfurin kawai ya canja.

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
