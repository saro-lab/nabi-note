---
title: YouTube
description: YouTube वीडियो को दस्तावेज़ में embed करके चौड़ाई बदलता है।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

YouTube वीडियो का पता या ID लेकर embed block बनाता है। दस्तावेज़ में पूरा पता नहीं, केवल 11-अक्षर video ID और चौड़ाई सहेजी जाती है; नया वीडियो बीच में 70% चौड़ाई से शुरू होता है।

चौड़ाई तय चरणों से चुनी जाती है और संरेखण वीडियो को समेटने वाले अनुच्छेद में सहेजा जाता है। संपादक में पहली click वीडियो चुनती है और चुने जाने के बाद अगली click उसे चलाती है। पता बदलने के बजाय वीडियो हटाकर नया डालें।

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## CSS शैलियाँ

वीडियो की सीमा और कोने `.nabi-content iframe` से बदल सकते हैं। सहेजी चौड़ाई और संरेखण न बदलें।

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

package वीडियो का आकार बनाए रखने के लिए `aspect-ratio`, चौड़ाई और alignment margin उपयोग करती है, इसलिए इन्हें override न करें।
