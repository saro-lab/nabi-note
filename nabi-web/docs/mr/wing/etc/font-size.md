---
title: अक्षर आकार
description: परवानगीच्या steps मध्ये text size बदला.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# अक्षर आकार

निवडलेला text size step मध्ये बदला. range निवडल्यास step त्या range ला लागू होते; फक्त caret असल्यास सध्याच्या paragraph चा text size बदलतो. साठवलेला data फक्त परवानगीचे steps ठेवतो, `px` सारखी मनमानी values नाही.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

`values` वगळल्यास `xs`, `sm`, `lg` आणि `xl` steps वापरले जातात. सूची अरुंद केल्यास जुन्या documents मध्ये आधीपासून असलेले इतर steps लोड करताना काढले जातात.

## CSS शैली

`.nabi-content [data-nabi-size="xs"]` सारख्या stored-step selectors ने sizes बदलू शकता. document मध्ये नसलेले मनमानी steps तयार करू नका; CSS फक्त नोंदवलेल्या `values` मध्ये समायोजित करा.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

steps मधील size difference एकसारखा ठेवल्यास document प्रकाशित झाल्यावर लेखकाने editor मध्ये निवडलेला अर्थ टिकतो.
