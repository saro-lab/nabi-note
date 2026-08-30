---
title: లింక్
description: సురక్షిత వెబ్ చిరునామాలను జోడించి అప్‌లోడ్ చేసిన జోడింపులను చూపండి.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# లింక్

వచనాన్ని ఎంచుకుని దానికి చిరునామాను జోడించండి. వచనం ఎంచుకోకుండా చిరునామా ఇస్తే, చిరునామానే లింక్ వచనంగా చేరుతుంది. `http://` లేదా `https://` చిరునామా టైప్ చేసి Space లేదా Enter నొక్కినా అది లింక్‌గా మారుతుంది.

లింక్‌లు `http:`, `https:`, అలాగే `.` లేదా `/`తో మొదలయ్యే అదే సైట్ మార్గాలనే నిల్వ చేస్తాయి. `javascript:` లేదా `//example.com` వంటి మూలం స్పష్టంగా తెలియని చిరునామాలు తిరస్కరించబడతాయి. అప్‌లోడ్ సృష్టించిన జోడింపు లింక్‌లు ఫైల్ సమాచారాన్నీ ఉంచుతాయి; వాటిని సాధారణ లింక్‌లా చేతితో సృష్టించలేరు.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## CSS శైలులు

సాధారణ లింక్‌లకు `.nabi-content a`, జోడింపు లింక్‌లకు విడిగా `.nabi-content a[data-nabi-file]`తో శైలి ఇవ్వండి.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

జోడింపు లింక్‌లోని `::before`, `::after` భాగాలు చిహ్నం, ఫైల్ పొడిగింపును చూపుతాయి; కాబట్టి సాధారణంగా వాటి `content`ను మార్చడం లేదా తొలగించడం మంచిది కాదు.
