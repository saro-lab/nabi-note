---
title: प्रतिमा
description: image URL घाला आणि width व alignment समायोजित करा.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# प्रतिमा

image URL घाला आणि त्याची width व alignment समायोजित करा. default ने addresses `http:`, `https:` किंवा त्याच site च्या paths पुरते मर्यादित असतात आणि नवी image 60% width वर मध्यभागी सुरू होते.

width फक्त ठराविक steps मध्ये साठवली जाते आणि alignment image ला wrap करणाऱ्या paragraph वर साठवले जाते. `blob:` किंवा `data:image/...` previews साठी image wing आणि editor assembly दोन्हींमध्ये local URLs स्पष्टपणे allow करा. SVG data URLs ला परवानगी नाही.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

हा wing document मध्ये address घालतो; तो files upload करत नाही. server वर files पाठवण्यासाठी [upload wing](/mr/wing/etc/upload) जोडा.

## CSS शैली

`.nabi-content img` ने images style करा. साठवलेली width आणि alignment जशी आहे तशी ठेवा व borders किंवा shadows सारखे दृश्य तपशीलच बदला.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

`max-inline-size`, `block-size`, width आणि alignment यांचे default rules ठेवा. image size document मध्ये साठवली जाते, म्हणून निश्चित CSS width सक्तीने लावल्यास लेखकाने निवडलेल्या width शी संघर्ष होऊ शकतो.
