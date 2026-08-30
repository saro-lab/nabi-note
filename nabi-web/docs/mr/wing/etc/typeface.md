---
title: अक्षरकुल
description: निवडलेल्या text किंवा paragraph ला typeface family लागू करा.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# अक्षरकुल

निवडलेल्या text ला typeface family लागू करा. range निवडल्यास फक्त ती range बदलते; फक्त caret असल्यास ते सध्याच्या paragraph मधील text ला लागू होते. प्रत्यक्ष font files आणि `font-family` values service CSS मध्ये ठरतात.

`sans`, `serif`, `mono` आणि `cursive` या default families आहेत. विशेषतः Korean किंवा इतर बहुभाषिक content असलेल्या services मध्ये प्रत्येक family ने कोणते fonts वापरावेत हे स्पष्टपणे ठरवणे चांगले आहे.

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

`values` वगळल्यास सर्व default families वापरल्या जातात. documents मध्ये `values` मधील valuesनाच परवानगी असते.

## CSS शैली

document फक्त family name साठवते आणि CSS font files निवडते. editor आणि प्रकाशित दृश्य दोन्हींसाठी त्याच container वर variables बदला.

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif", "Noto Serif KR", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

web fonts वापरत असल्यास प्रथम त्या font files लोड करा. अनेक भाषांसाठी `cursive` मध्ये पुरेसे coverage नसते, म्हणून service कोणता प्रत्यक्ष font वापरेल ते निवडल्यानंतरच ते देणे योग्य आहे.
