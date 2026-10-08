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

## इमेज चुनने का पैनल जोड़ना

इमेज बटन के डिफ़ॉल्ट URL इनपुट पैनल की जगह अपनी सेवा का इमेज चयन पैनल लगाने के लिए `mountToolbar()` में `panels.img` दें। कुंजियाँ टूलबार स्लॉट के नाम हैं; जिन टूल का उल्लेख नहीं है, वे अपने डिफ़ॉल्ट पैनल बनाए रखते हैं।

`mode: 'modal'` पूरे पृष्ठ को ढकने वाली अर्धपारदर्शी पृष्ठभूमि पर एक विंडो खोलता है। `mode: 'inline'` डेस्कटॉप पर टूल बटन के पास और मोबाइल पर पूरी स्क्रीन में खुलता है। मोबाइल दृश्य का निर्धारण व्यूपोर्ट की चौड़ाई और `--nabi-mobile-breakpoint` से होता है; खुले `inline` पैनल के दौरान यह सीमा पार होने पर पैनल बंद हो जाता है।

दोनों मोड केवल खाली `root` देते हैं; शीर्षक, इनपुट फ़ील्ड या बटन नहीं बनाते। `render` में अपना HTML या UI जोड़ें, बंद करने का बटन `close()` से और इमेज चयन `insertImage(url, 'pointer')` से जोड़ें। मौजूदा फ़ंक्शन वाली सेटिंग (`img: renderer`) का प्रदर्शन व्यवहार बना रहता है।

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: {
      mode: 'inline',
      render: ({ root, signal, close, insertImage }) =>
        mountMyImagePicker(root, {
          signal,
          onClose: close,
          onSelect: (url: string) => insertImage(url, 'pointer'),
        }),
    },
  },
})
```

`mountMyImagePicker` एक फ़ंक्शन है जिसे आप अपनी सेवा में लागू करते हैं। यह दिए गए `root` में आपका UI समकालिक रूप से बनाता है और सफ़ाई के लिए एक फ़ंक्शन लौटाता है। इमेज सूची लाने या अपलोड करने जैसे असमकालिक कामों से `signal` जोड़ें और चुनी गई इमेज का URL `onSelect` को दें। यह API फ़ाइलें नहीं भेजता; इमेज URL की अनुमति के मौजूदा नियम लागू रहते हैं।

`insertImage(src, by?)`, `run('insertImage', { src }, by)` के बराबर है, जिसमें लौटाया गया मान और चयन बहाल करने के नियम भी शामिल हैं। `by` छोड़ने पर `'keyboard'` इस्तेमाल होता है। `render` को `async` फ़ंक्शन न बनाएँ।

पैनल बंद करने या टूलबार अनमाउंट करने पर `signal` रद्द होता है और सफ़ाई फ़ंक्शन चलता है। `run()` पैनल बंद करता है और खुलने के समय दर्ज चयन पर कमांड एक बार लागू करता है। पैनल पहले ही बंद हो चुका हो या खुलने के बाद दस्तावेज़ की सामग्री बदल गई हो, तो कमांड चलाए बिना `false` लौटाता है।

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
