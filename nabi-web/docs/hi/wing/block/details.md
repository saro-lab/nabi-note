---
title: खोलने-बंद करने वाला खंड
description: सार और मुख्य सामग्री को बाँधकर आरंभिक खुली स्थिति सहेजता है।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# खोलने-बंद करने वाला खंड

छोटे सार और मुख्य सामग्री को एक block में बाँधता है। टूलबार से बनाने पर पहले सार लिखें और फिर उसके नीचे सामग्री जारी रखें।

त्रिकोण से तय खुली स्थिति दस्तावेज़ में सहेजी जाती है और प्रकाशित पृष्ठ की आरंभिक स्थिति बनती है। संपादन के समय सामग्री बदलने के लिए body खुली रहती है, लेकिन सहेजा गया state नहीं बदलता।

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## CSS शैलियाँ

block को `.nabi-content details` और उसके शीर्षक को `.nabi-content details > summary` से सजाएँ।

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

`open` attribute लेखक द्वारा सहेजी आरंभिक खुली स्थिति है। CSS इसे सजा सकता है, लेकिन इस स्थिति को जबरन बदलना ठीक नहीं है।
