---
title: टाइपफ़ेस
description: चुने हुए पाठ या अनुच्छेद पर टाइपफ़ेस श्रेणी लागू करता है।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# टाइपफ़ेस

चुने हुए पाठ पर टाइपफ़ेस श्रेणी लागू करता है। दायरा चुना हो तो केवल वही बदलता है; केवल caret हो तो मौजूदा अनुच्छेद के पाठ पर लागू होता है। वास्तविक font files और `font-family` सेवा की CSS तय करती है।

मूल श्रेणियाँ `sans`, `serif`, `mono`, `cursive` हैं। कई लिपियों वाली सेवा में हर श्रेणी से जुड़ा वास्तविक font स्पष्ट रूप से तय करना बेहतर है।

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

`values` न देने पर सभी मूल श्रेणियाँ उपयोग होती हैं। दस्तावेज़ में केवल `values` में रखे मान अनुमत हैं।

## CSS शैलियाँ

दस्तावेज़ में केवल श्रेणी का नाम सहेजा जाता है; font file CSS तय करती है। संपादक और प्रकाशित पृष्ठ के समान container में variables बदलें।

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif Devanagari", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

web font इस्तेमाल करें तो उसकी file भी पहले लोड करें। `cursive` में देवनागरी समर्थित font अक्सर नहीं मिलता, इसलिए सेवा में सचमुच उपयोग होने वाला font तय करने के बाद ही यह विकल्प देना बेहतर है।
