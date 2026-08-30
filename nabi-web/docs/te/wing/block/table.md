---
title: పట్టిక
description: అడ్డు వరుసలు, నిలువు వరుసలను సృష్టించి సెల్‌లను సవరించి కాలమ్ క్రమీకరణకు మద్దతు ఇవ్వండి.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# పట్టిక

పట్టికను సృష్టించడానికి టూల్‌బార్‌లో అడ్డు వరుసలు, నిలువు వరుసలు ఎంచుకోండి. సెల్‌లో వచనం అనేక పేరాల బదులు పంక్తి విరామాలతో కొనసాగుతుంది; Tab, Shift+Tab తదుపరి లేదా మునుపటి సెల్‌కు కదులుతాయి.

వరుసలు లేదా కాలమ్‌లను చేర్చడం, తొలగించడం, సెల్‌లను విలీనం చేయడం, హెడ్డర్ సెల్‌లను మార్చడం ఎంచుకున్న సెల్‌ల చుట్టూ పనిచేస్తాయి. క్రమీకరించదగిన పట్టికను భద్రపరచిన తర్వాత ప్రచురిత వీక్షణలో కాలమ్ క్రమీకరణకు `nabi-note/viewer`లోని `attachViewer()`ను కలపండి. విలీన సెల్‌లున్న పట్టికలు క్రమీకరించబడవు.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## CSS శైలులు

పట్టికకు `.nabi-content table`, సెల్‌లకు `.nabi-content :is(th, td)`తో శైలి ఇవ్వండి. సెల్ నిర్మాణాన్ని లేదా వీయర్ చేర్చే క్రమీకరణ బటన్‌ను మార్చవద్దు.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

వీయర్ కలిపి ఉంటే `.nabi-sort` బటన్‌ను ఉంచండి. సెల్ `position` లేదా కుడి ప్యాడింగ్‌ను బలవంతంగా ఓవర్‌రైడ్ చేస్తే అది క్రమీకరణ బటన్‌పై పడవచ్చు.
