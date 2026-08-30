---
title: Rangi ya maandishi
description: Weka jina la rangi linaloruhusiwa kwenye maandishi yaliyochaguliwa.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Rangi ya maandishi

Weka jina la rangi linaloruhusiwa kwenye maandishi yaliyochaguliwa. Thamani inayohifadhiwa si mfuatano wa rangi wa CSS; ni jina linaloruhusiwa, na rangi halisi huamuliwa na kigeu cha CSS `--nabi-tc-<name>`. Kwa hiyo hati ileile husomeka katika mandhari mepesi na meusi.

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

Ukiacha `values`, paleti chaguomsingi ni `green`, `coral`, `violet`, `amber`, na `blue`. Ukipunguza orodha, rangi nyingine hukataliwa na amri na wakati wa kupakia hati.

## Mitindo ya CSS

Hati huhifadhi majina ya rangi pekee. Weka rangi halisi za kihariri na mwonekano uliochapishwa kwa vigeu vya CSS.

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

Kagua utofauti pamoja na rangi ya mandharinyuma. Katika mandhari meusi, jina lilelile la rangi linaweza kupewa thamani tofauti.

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
