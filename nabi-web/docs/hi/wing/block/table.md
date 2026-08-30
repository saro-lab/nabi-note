---
title: तालिका
description: पंक्तियाँ और स्तंभ बनाकर cell editing और column sorting देती है।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# तालिका

टूलबार में पंक्तियाँ और स्तंभ चुनकर तालिका बनाएँ। cell के भीतर कई अनुच्छेदों के बजाय line break से सामग्री जारी रहती है; Tab और Shift+Tab अगले और पिछले cell पर जाते हैं।

पंक्ति और स्तंभ जोड़ना या हटाना, cell merge और header cell बदलना चुने हुए cell पर काम करता है। तालिका को sortable सहेजने के बाद प्रकाशित पृष्ठ पर column sorting के लिए `nabi-note/viewer` का `attachViewer()` जोड़ें। merged cells वाली तालिका column sorting के योग्य नहीं है।

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## CSS शैलियाँ

तालिका को `.nabi-content table` और cells को `.nabi-content :is(th, td)` से सजाएँ। cell संरचना और viewer का sorting button न बदलें।

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

viewer जुड़ा हो तो `.nabi-sort` button रहने दें। cell का `position` या दायाँ padding जबरन बदलने पर sorting button से overlap हो सकता है।
