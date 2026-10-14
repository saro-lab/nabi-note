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
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

संपादक के `.nabi` और प्रकाशित दृश्य के `.nabi-content` पर एक ही थीम क्लास दें ताकि समान variables लागू हों। सेवा का CSS पैकेज CSS के बाद लोड करें और वर्तमान थीम `data-nabi-theme` से बताएँ।

```html
<div class="nabi brand-note" data-nabi-theme="light">...</div>
<article class="nabi-content brand-note" data-nabi-theme="light">...</article>
```

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
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

हाइलाइट और टेक्स्ट रंग क्रमशः `--nabi-hl-<name>` और `--nabi-tc-<name>` इस्तेमाल करते हैं। तालिका की कोशिका पृष्ठभूमि `--nabi-cell-<name>` के साथ `yellow`, `green`, `cyan`, `pink`, `purple`, `orange` स्वीकार करती है। variables केवल दिखने वाला रंग बदलते हैं, सहेजा हुआ नाम नहीं।

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

डिफ़ॉल्ट थीम कोशिकाओं की पृष्ठभूमि हल्के रंगों में दिखाती है। डार्क मोड नाम बनाए रखकर अलग, अधिक उजले और कम संतृप्त रंग इस्तेमाल करता है, ताकि गहरे आधार पर पहचान आसान हो। ये अर्धपारदर्शी रंग पीछे का आधार दिखाते हैं; बदलते समय वास्तविक पृष्ठभूमि पर टेक्स्ट का कंट्रास्ट जाँचें। डिफ़ॉल्ट रंग variables ओवरराइड करने के लिए थीम क्लास ऊपर की तरह वास्तविक संपादक या प्रकाशित सामग्री के तत्व पर दें, किसी मनमाने बाहरी पैरेंट पर नहीं।

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## मोबाइल मोड की सीमा

डिफ़ॉल्ट `layout: 'compact'` टूलबार स्क्रीन `36rem` से कम चौड़ी होने पर मोबाइल की एक पंक्ति में बदलता है। ठीक `36rem` पर डेस्कटॉप लेआउट रहता है। डेस्कटॉप पर संपादक संकरा होने पर भी सभी टूल अगली पंक्तियों में आते हैं। ऑब्जेक्ट गुण टूल भी नीचे लपेटते हैं; दोनों पंक्तियाँ सामग्री के ऊपर जगह लेती हैं। फ़ुलस्क्रीन में चौड़ाई की परवाह किए बिना सभी टूल खुलते हैं।

मोबाइल पर त्वरित टूल, सभी टूल का बटन और जुड़े प्रीव्यू/फ़ुलस्क्रीन बटन मुख्य टूलबार में रहते हैं। गुण टूल दिखने पर भी ये साथ इस्तेमाल होते हैं। सभी टूल का पैलेट डेस्कटॉप वाला समूह क्रम और विभाजक इस्तेमाल करता है। `layout: 'wrap'` हमेशा सभी टूल को पंक्तियों में लपेटकर दिखाता है।

मोबाइल पैनल टूलबार और गुण टूल के आसपास उपलब्ध जगह में खुलते हैं। तालिका आकार चयनकर्ता अपवाद है: यह अर्धपारदर्शी आधार पर बीच में, छूने में आसान 5×5 ग्रिड के साथ खुलता है। कीबोर्ड बंद होने की प्रतीक्षा नहीं करता; आकार चुनते ही एक तालिका डालकर बंद हो जाता है।

सीमा बदलने के लिए `--nabi-mobile-breakpoint` को `:root`, किसी पूर्वज या अलग `.nabi` पर सेट करें। `rem`, `px`, `calc()` जैसी गैरऋणात्मक CSS लंबाई लें। CSS मान, रूट फ़ॉन्ट आकार या स्क्रीन चौड़ाई बदलने पर खुले पैनल भी स्वतः अपडेट होते हैं। `body` के नीचे ले जाए इनपुट पैनल मूल संपादक की सीमा रखते हैं।

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

फ्लोट क्षेत्रों का एक कॉलम में बदलने का मानदंड अलग है। स्क्रीन नहीं, सामग्री कंटेनर `36rem` से कम चौड़ा होने पर एक कॉलम दिखता है; प्रिंट में भी यही लेआउट होता है।

## dark mode

light mode default है। `html` या `body` पर `.dark` जोड़ें, या किसी editor अथवा published body पर `data-nabi-theme="dark"` दें।

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

ancestor `.dark` से बाहर रहने के लिए `data-nabi-theme="light"` उपयोग करें। theme switching application नियंत्रित करती है; package अपने-आप `prefers-color-scheme` नहीं मानती।

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
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
  --nabi-font: "Noto Serif KR", serif;
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
