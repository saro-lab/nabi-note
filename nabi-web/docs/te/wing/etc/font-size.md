---
title: అక్షర పరిమాణం
description: అనుమతించిన దశల్లో వచన పరిమాణాన్ని మార్చండి.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# అక్షర పరిమాణం

ఎంచుకున్న వచనాన్ని ఒక పరిమాణ దశకు మార్చండి. పరిధి ఎంచుకుని ఉంటే ఆ పరిధికి వర్తిస్తుంది; కర్సర్ మాత్రమే ఉంటే ప్రస్తుత పేరా వచన పరిమాణం మారుతుంది. నిల్వ డేటా `px` వంటి ఏకపక్ష విలువలను కాకుండా అనుమతించిన దశలనేం ఉంచుతుంది.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

`values`ను వదిలేస్తే `xs`, `sm`, `lg`, `xl` దశలు వాడతారు. జాబితాను కుదిస్తే పాత పత్రాల్లో ఉన్న ఇతర దశలు లోడ్ చేసినప్పుడు తొలగిపోతాయి.

## CSS శైలులు

`.nabi-content [data-nabi-size="xs"]` వంటి నిల్వ-దశ సెలెక్టర్లతో పరిమాణాలు మార్చవచ్చు. పత్రంలో లేని ఏకపక్ష దశలను సృష్టించవద్దు; నమోదైన `values`లోనే CSSను సర్దండి.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

దశల మధ్య పరిమాణ వ్యత్యాసాన్ని స్థిరంగా ఉంచితే, పత్రం ప్రచురించినప్పుడు రచయిత ఎడిటర్‌లో ఎంచుకున్న అర్థం నిలుస్తుంది.
