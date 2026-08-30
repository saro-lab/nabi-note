---
title: Rangi ya kuangazia
description: Weka rangi ya kuangazia iliyoruhusiwa nyuma ya maandishi yaliyochaguliwa.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Rangi ya kuangazia

Weka rangi ya kuangazia nyuma ya maandishi yaliyochaguliwa. Data iliyohifadhiwa huhifadhi majina ya rangi yanayoruhusiwa pekee, si thamani zozote za rangi za CSS; hivyo data ya hati na mtindo wa mwonekano hubaki tofauti.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

Ukiacha `values`, paleti chaguomsingi ni `yellow`, `green`, `cyan`, `pink`, `purple`, na `orange`. Ukipunguza orodha, rangi ambazo hazijasajiliwa hazitahifadhiwa hata hati ya zamani inapopakiwa.

## Mitindo ya CSS

Hati huhifadhi majina ya rangi pekee. Badilisha rangi za kihariri na mwonekano uliochapishwa kwa vigeu vya CSS.

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

Kubadilisha rangi kadhaa pamoja hukuruhusu kuweka majina ya rangi ya hati yaleyale huku ukirekebisha tu hisia ya bidhaa.

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
