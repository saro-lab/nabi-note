---
title: चित्र
description: चित्र का पता डालकर उसकी चौड़ाई और संरेखण बदलता है।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# चित्र

चित्र का पता डालकर उसकी चौड़ाई और संरेखण बदलता है। मूल रूप से केवल `http:`, `https:` और उसी site के path अनुमत हैं; नया चित्र बीच में 60% चौड़ाई से शुरू होता है।

चौड़ाई केवल तय चरणों में सहेजी जाती है और संरेखण चित्र को समेटने वाले अनुच्छेद में सहेजा जाता है। `blob:` और `data:image/...` preview के लिए image wing और editor assembly, दोनों में local URL स्पष्ट रूप से अनुमत करें। SVG data URL अनुमत नहीं हैं।

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

यह wing पता दस्तावेज़ में रखती है, file transfer नहीं करती। file server पर भेजने के लिए [upload wing](/hi/wing/etc/upload) जोड़ें।

## CSS शैलियाँ

चित्र को `.nabi-content img` से सजाएँ। सहेजी चौड़ाई और संरेखण कायम रखते हुए केवल सीमा या छाया जैसा रूप बदलें।

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

`max-inline-size`, `block-size`, चौड़ाई और संरेखण के मूल नियम न बदलें। चित्र का आकार दस्तावेज़ में सहेजा है; CSS में जबरन आकार तय करने पर लेखक की चौड़ाई से टकराव हो सकता है।
