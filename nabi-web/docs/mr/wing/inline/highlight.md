---
title: हायलाइट
description: निवडलेल्या मजकुरामागे परवानगी असलेला highlight रंग लावा.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# हायलाइट

निवडलेल्या मजकुरामागे परवानगी असलेला highlight रंग लावा. साठवलेला data फक्त परवानगीचे रंगनाव ठेवतो, मनमाना CSS रंगमूल्य नाही; त्यामुळे document data आणि दृश्य शैली वेगळी राहते.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

`values` वगळल्यास `yellow`, `green`, `cyan`, `pink`, `purple` आणि `orange` हे default palette असते. सूची अरुंद केल्यास जुने document लोड करतानादेखील नोंद नसलेले रंग ठेवले जात नाहीत.

## CSS शैली

document फक्त रंगनाव साठवते. CSS variables ने editor आणि प्रकाशित दृश्याचे रंग बदला.

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

अनेक रंग एकत्र बदलल्याने document मधील रंगनावे तशीच ठेवून फक्त उत्पादनाचा shade समायोजित करता येतो.

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
