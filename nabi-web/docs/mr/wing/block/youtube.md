---
title: YouTube
description: document मध्ये YouTube video embed करा आणि त्याची width बदला.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

YouTube video URL किंवा video ID स्वीकारून त्याचे embed block करा. document पूर्ण URL नव्हे तर फक्त 11-अक्षरी video ID आणि width साठवते, आणि नवा video 70% width वर मध्यभागी सुरू होतो.

width ठराविक steps मधून निवडली जाते आणि alignment video ला wrap करणाऱ्या paragraph वर साठवले जाते. editor मध्ये पहिला click video निवडतो; निवडल्यानंतर पुन्हा click केल्यास तो play होऊ शकतो. address बदलण्यासाठी video काढून नवा घाला.

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## CSS शैली

video ची border किंवा corners बदलण्यासाठी `.nabi-content iframe` वापरा. साठवलेली width किंवा alignment बदलू नका.

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

video चा आकार योग्य ठेवण्यासाठी package `aspect-ratio`, width आणि alignment margins वापरते, म्हणून ते override करू नका.
