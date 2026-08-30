---
title: CSS థీమ్‌లు
description: CSS వేరియబుల్స్‌తో ఎడిటర్, ప్రచురిత కంటెంట్‌కు రంగులు, ఫాంట్‌లు, పరిమాణం, ముదురు మోడ్‌ను అమర్చండి.
---

# CSS థీమ్‌లు

NABI NOTE సవరణ, ప్రచురిత కంటెంట్‌కు ఒకే CSSను వాడుతుంది. ప్యాకేజీ స్టైల్‌షీట్‌ను ఒకసారి లోడ్ చేసి, సేవ కంటైనర్‌లో అవసరమైన వేరియబుల్స్‌ను మాత్రమే ఓవర్‌రైడ్ చేయండి.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

ఎడిటర్, దాని ప్రచురిత వీక్షణ ఒకే దృశ్య భాషను ఉంచేలా పంచుకున్న టోకెన్‌లను ఉమ్మడి తల్లిదండ్రిపై ఉంచండి.

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## సాధారణ వేరియబుల్స్

| ఉద్దేశ్యం | వేరియబుల్స్ |
| --- | --- |
| వచనం, నేపథ్యం | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| అంచులు, యాక్సెంట్ | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| మూలలు, నీడలు | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| ఫాంట్ కుటుంబాలు | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| సవరణ సర్ఫేస్ | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| అంటుకునే టూల్‌బార్, ప్రివ్యూ | `--nabi-sticky-top`, `--nabi-preview-width` |
| టచ్ నియంత్రణలు | `--nabi-touch-font-size`, `--nabi-touch-control-size` |

హైలైట్, వచన రంగు టోకెన్‌లు `--nabi-hl-<name>`, `--nabi-tc-<name>`ను వాడతాయి. ఉదాహరణకు `--nabi-hl-yellow`ను మార్చితే పత్ర డేటాను మార్చకుండా నిల్వ చేసిన `yellow` హైలైట్‌ల రంగు మారుతుంది.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## ముదురు మోడ్

లేత మోడ్ డిఫాల్ట్. `html` లేదా `body`కి `.dark`ను చేర్చండి, లేదా నిర్దిష్ట ఎడిటర్ లేదా ప్రచురిత బాడీపై `data-nabi-theme="dark"`ను సెట్ చేయండి.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

తల్లిదండ్రి `.dark` నుంచి మినహాయించుకోవడానికి `data-nabi-theme="light"` వాడండి. థీమ్ మార్పును మీ అప్లికేషన్ నియంత్రిస్తుంది; ప్యాకేజీ `prefers-color-scheme`ను స్వయంగా అనుసరించదు.

```css
.dark .brand-note {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## ప్రచురిత కంటెంట్‌కూ శైలి ఇవ్వండి

ప్రచురిత HTMLకూ `.nabi-content`, అదే CSS అవసరం. పట్టికలు, కోడ్ బ్లాక్‌లు, చిత్రాలు, చెక్‌లిస్ట్‌లు, పెద్ద తొలి అక్షరాలు JavaScript లేకుండానే రెండర్ అవుతాయి. పట్టిక క్రమీకరణ లేదా కోడ్ హైలైటింగ్ వంటి ప్రవర్తనలకు మాత్రమే `nabi-note/viewer`ను చేర్చండి.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Source Serif 4", Georgia, serif;
  --nabi-bg: transparent;
}
```

బాడీ వెడల్పు, పంక్తి ఎత్తు వంటి ప్యాకేజీకి చెందని లేఅవుట్‌ను మీ సేవ క్లాస్‌పై సెట్ చేయండి.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## సవరణ నిర్మాణాన్ని మార్చవద్దు

సవరణలోని `[data-key]` నోడ్‌లపై `display` లేదా `white-space`ను మార్చవద్దు, సవరించగల వచనంలో ప్సూడో-ఎలిమెంట్‌లను చేర్చవద్దు, ఆబ్జెక్ట్ ర్యాపర్‌లలో పాయింటర్ ప్రవర్తనను నిలిపివేయవద్దు. ఈ నియమాలు కర్సర్ జ్యామితి, పత్ర మ్యాపింగ్‌ను చెడగొట్టవచ్చు.

ప్రచురిత పెద్ద తొలి అక్షరాలు `::first-letter`ను వాడతాయి; సవరణ సర్ఫేస్ నిజమైన `[data-nabi-dropcap-letter]` ఎలిమెంట్‌ను వాడుతుంది. `.nabi-editing`లో మరో `::first-letter` నియమాన్ని చేర్చవద్దు లేదా ఆ ఎలిమెంట్‌ను భర్తీ చేయవద్దు.
