---
title: CSS थीम
description: CSS variables से editor और published content के रंग, font, आकार और dark mode तय करें।
---

# CSS थीम

NABI NOTE editing और published content में समान CSS उपयोग करता है। package stylesheet एक बार load करें और service container पर केवल आवश्यक variables override करें।

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

editor और published view में समान visual language रखने के लिए साझा tokens सामान्य parent पर रखें।

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

## सामान्य variables

| उद्देश्य | variables |
| --- | --- |
| पाठ और background | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| सीमाएँ और accent | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| कोने और shadows | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| font families | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| editing surface | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| sticky toolbar और preview | `--nabi-sticky-top`, `--nabi-preview-width` |
| touch controls | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| मोबाइल मोड में बदलने की चौड़ाई | `--nabi-mobile-breakpoint` |

highlight और text-color tokens `--nabi-hl-<name>` और `--nabi-tc-<name>` उपयोग करते हैं। जैसे `--nabi-hl-yellow` बदलने से saved `yellow` highlight का display color बदलता है, document data नहीं।

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## मोबाइल मोड की सीमा

टूलबार, संदर्भ पंक्ति या व्यूपोर्ट की चौड़ाई `36rem` से कम होने पर मोबाइल मोड चालू होता है। ठीक `36rem` पर सामान्य लेआउट बना रहता है। मोबाइल मोड में टूलबार और संदर्भ पंक्ति क्षैतिज रूप से स्क्रॉल होती हैं, पैनल बीच में दिखते हैं और तालिका चयन ग्रिड स्पर्श के अनुकूल 5×5 खानों का हो जाता है।

सीमा बदलने के लिए `--nabi-mobile-breakpoint` को `:root`, किसी पूर्वज तत्व या अलग `.nabi` पर सेट करें। `rem`, `px` या `calc()` जैसी गैर-ऋणात्मक CSS लंबाई इस्तेमाल करें। CSS मान, रूट फ़ॉन्ट आकार, कंटेनर या व्यूपोर्ट की चौड़ाई बदलने पर खुले पैनल भी अपने आप अपडेट होते हैं। `body` के नीचे ले जाए गए इनपुट पैनल मूल एडिटर की सीमा का उपयोग करते रहते हैं।

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

स्पर्श उपकरणों पर इस सीमा से अधिक चौड़ाई में भी बड़े नियंत्रण बने रहते हैं।

## dark mode

light mode default है। `html` या `body` पर `.dark` जोड़ें, या किसी editor अथवा published body पर `data-nabi-theme="dark"` दें।

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

ancestor `.dark` से बाहर रहने के लिए `data-nabi-theme="light"` उपयोग करें। theme switching application नियंत्रित करती है; package अपने-आप `prefers-color-scheme` नहीं मानती।

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

## published content भी style करें

published HTML को भी `.nabi-content` और वही CSS चाहिए। table, code block, image, checklist और drop cap JavaScript के बिना render होते हैं। table sorting या code highlighting जैसे behavior के लिए ही `nabi-note/viewer` जोड़ें।

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif Devanagari", serif;
  --nabi-bg: transparent;
}
```

body width और line height जैसा layout, जिसका मालिक package नहीं है, service class पर रखें।

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## editing structure न बदलें

editing `[data-key]` nodes का `display` या `white-space` न बदलें, editable text में pseudo-elements न जोड़ें और object wrappers का pointer behavior disable न करें। ये नियम caret geometry और document mapping तोड़ सकते हैं।

published drop cap `::first-letter` उपयोग करता है, जबकि editing surface वास्तविक `[data-nabi-dropcap-letter]` element उपयोग करती है। `.nabi-editing` में दूसरा `::first-letter` rule न जोड़ें और उस element को न बदलें।
