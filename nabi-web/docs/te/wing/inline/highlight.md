---
title: హైలైట్
description: ఎంచుకున్న వచనం వెనుక అనుమతించిన హైలైట్ రంగును వర్తింపజేయండి.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# హైలైట్

ఎంచుకున్న వచనం వెనుక అనుమతించిన హైలైట్ రంగును వర్తింపజేయండి. నిల్వ డేటా స్వేచ్ఛా CSS రంగు విలువలను కాకుండా అనుమతించిన రంగు పేర్లనే ఉంచుతుంది; అందువల్ల పత్ర డేటా, దృశ్య శైలి వేరుగా ఉంటాయి.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

`values`ను వదిలేస్తే డిఫాల్ట్ పాలెట్ `yellow`, `green`, `cyan`, `pink`, `purple`, `orange`. జాబితాను కుదిస్తే, నమోదుకాని రంగులు పాత పత్రాలను లోడ్ చేసినప్పుడు కూడా నిలవవు.

## CSS శైలులు

పత్రం రంగు పేరును మాత్రమే నిల్వ చేస్తుంది. CSS వేరియబుల్స్ ద్వారా ఎడిటర్, ప్రచురిత వీక్షణ రంగును మార్చండి.

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

అనేక రంగులను కలిపి మార్చితే పత్రంలోని రంగు పేర్లు అలాగే ఉండగా ఉత్పత్తి రంగుల ఛాయలనే సర్దవచ్చు.

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
