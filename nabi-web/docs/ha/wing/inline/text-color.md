---
title: Launin rubutu
description: Sanya sunan launi da aka yarda da shi ga rubutun da aka zaɓa.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Launin rubutu

Sanya sunan launi da aka yarda da shi ga rubutun da aka zaɓa. Ƙimar da aka adana ba jerin launin CSS ba ce: suna ne da aka yarda da shi, kuma ainihin launin mai canjin CSS `--nabi-tc-<name>` ne yake ƙayyade shi. Saboda haka takarda ɗaya tana iya zama mai sauƙin karantawa a yanayin haske da duhu.

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

Idan aka bar `values`, rumbun tsoho shi ne `green`, `coral`, `violet`, `amber`, da `blue`. Idan aka rage jerin, umarni da buɗe takarda ba za su karɓi sauran launuka ba.

## Salon CSS

Takarda tana adana sunan launi kawai. Ƙayyade ainihin launi na editan da shafin da aka buga da masu canjin CSS.

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

Duba bambancin launi tare da bayan fage. A yanayin duhu, suna ɗaya na launi zai iya samun ƙima dabam.

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
