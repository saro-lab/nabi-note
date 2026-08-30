---
title: Girman rubutu
description: Yana canza girman rubutu a cikin matakan da aka yarda.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Girman rubutu

Yana canza matakin girman haruffan da aka zaɓa. Idan ka zaɓi kewayo, yana amfani da shi ga wannan kewayon; idan alama kawai take akwai, yana canza girman haruffan sakin layi na yanzu. A bayanan da ake adanawa, ba a bar ƙima ta son rai kamar `px`, sai matakan da aka yarda da su.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

Idan ka bar `values`, ana amfani da matakan `xs`, `sm`, `lg`, `xl`. Idan ka taƙaita jerin, wasu matakan da ke cikin tsohon daftari ma za a cire su lokacin lodawa.

## Tsarin CSS

Za ka iya canza girma da zaɓaɓɓen matakin da aka adana, kamar `.nabi-content [data-nabi-size="xs"]`. Kada ka ƙirƙiri wani mataki na son rai wanda ba ya cikin daftari; daidaita CSS ne kawai a cikin `values` da ka yi rajista.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

Idan ka sa banbancin girma tsakanin matakai ya zama daidai, ma'anar zaɓin marubuci a editan tana nan a shafin da aka wallafa.
