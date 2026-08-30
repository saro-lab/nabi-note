---
title: صورة
description: يضيف عنوان صورة ويضبط العرض والمحاذاة.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# صورة

يضيف عنوان صورة ويضبط عرضها ومحاذاتها. لا يُسمح افتراضيًا إلا بعناوين `http:` و`https:` ومسارات الموقع نفسه، وتبدأ الصورة الجديدة بمحاذاة وسط وعرض 60%.

يُحفظ العرض ضمن درجات محددة، وتُحفظ المحاذاة في الفقرة التي تحتوي الصورة. لاستخدام معاينات `blob:` أو `data:image/...`، اسمح بالعناوين المحلية صراحة في image wing وفي تجميع المحرر. ولا تُقبل عناوين بيانات SVG.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

تضع هذه wing العنوان في المستند ولا تنقل الملف. لإرسال الملف إلى الخادم، صِل [wing الرفع](/ar/wing/etc/upload).

## أنماط CSS

نسّق الصورة عبر `.nabi-content img`. أبقِ العرض والمحاذاة المحفوظين، وغيّر الشكل فقط مثل الحدود أو الظل.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

أبقِ القواعد الأساسية لـ`max-inline-size` و`block-size` والعرض والمحاذاة. حجم الصورة محفوظ في المستند، وفرضه في CSS قد يتعارض مع اختيار الكاتب.
