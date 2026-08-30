---
title: ड्रॉप कैप
description: अनुच्छेद की पहली अक्षर-इकाई को बड़ा रखकर मुख्य पाठ शुरू करता है।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ड्रॉप कैप

अनुच्छेद की पहली अक्षर-इकाई को बड़ा रखता है और बाकी पंक्तियाँ उसके बगल से बहती हैं। यह अनुच्छेद-स्तरीय formatting है, इसलिए अक्षरों के केवल एक हिस्से को चुनकर लागू नहीं होती।

प्रकाशित और संपादन दृश्य का रूप समान रहता है। संपादन के समय पहली अक्षर-इकाई को वास्तविक element में लपेटा जाता है ताकि caret और deletion position न बिगड़ें; यह element सहेजे गए दस्तावेज़ में शामिल नहीं होता।

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## CSS शैलियाँ

प्रकाशित और संपादन दृश्य में केवल पहली अक्षर-इकाई का selector अलग है। प्रकाशित दृश्य `[data-nabi-dropcap="1"]::first-letter` और संपादन दृश्य वास्तविक `[data-nabi-dropcap-letter]` element उपयोग करता है। रंग, font या आकार बदलते समय दोनों selectors साथ लिखें, तभी संपादन और प्रकाशन का रूप समान रहेगा।

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

आकार और line height बदलनी हो तो दोनों selectors पर समान मान लगाएँ।

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

ड्रॉप कैप पहली अक्षर-इकाई के आसपास पंक्तियों का बहाव गणना करता है। केवल एक दृश्य बदलने या आकार बहुत बढ़ाने से WYSIWYG टूट सकता है। संपादन दृश्य में नया `::first-letter` न जोड़ें; मौजूदा `[data-nabi-dropcap-letter]` को ही सजाएँ।
