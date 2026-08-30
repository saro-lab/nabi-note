---
title: Ukubwa wa Herufi
description: Badilisha ukubwa wa maandishi ndani ya hatua zinazoruhusiwa.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Ukubwa wa Herufi

Badilisha maandishi yaliyochaguliwa hadi hatua ya ukubwa. Eneo likichaguliwa, hatua hutumika kwa eneo hilo; ikiwa kuna kielekezi pekee, hubadilisha ukubwa wa maandishi wa aya ya sasa. Data iliyohifadhiwa huhifadhi hatua zinazoruhusiwa pekee, si thamani za kiholela kama `px`.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

Iwapo `values` itaachwa, hatua za `xs`, `sm`, `lg`, na `xl` hutumika. Ukipunguza orodha, hatua nyingine zilizomo tayari kwenye hati za zamani huondolewa zinapopakiwa.

## Mitindo ya CSS

Unaweza kubadilisha ukubwa kupitia viteuzi vya hatua zilizohifadhiwa kama `.nabi-content [data-nabi-size="xs"]`. Usibuni hatua za kiholela ambazo hazimo kwenye hati; rekebisha CSS ndani ya `values` zilizosajiliwa pekee.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

Kudumisha tofauti ya ukubwa kati ya hatua kwa uthabiti huhifadhi maana ambayo mwandishi alichagua kwenye kihariri hati inapochapishwa.
