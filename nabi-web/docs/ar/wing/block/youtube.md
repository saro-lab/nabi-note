---
title: YouTube
description: يضمّن فيديو YouTube في المستند ويضبط عرضه.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

يستقبل عنوان فيديو YouTube أو معرّفه وينشئ كتلة مضمّنة. لا يُحفظ العنوان الكامل، بل معرّف الفيديو المكوّن من 11 حرفًا والعرض فقط، ويبدأ الفيديو الجديد بمحاذاة وسط وعرض 70%.

يُختار العرض من درجات محددة، وتُحفظ المحاذاة في الفقرة التي تحتوي الفيديو. في المحرر تحدد النقرة الأولى الفيديو، وتشغله النقرة الثانية بعد التحديد. لتغيير العنوان، احذف الفيديو وأدرج واحدًا جديدًا.

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## أنماط CSS

يمكن تغيير حدود الفيديو وزواياه عبر `.nabi-content iframe`. لا تغيّر العرض والمحاذاة المحفوظين.

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

تستخدم الحزمة `aspect-ratio` والعرض وmargin المحاذاة للحفاظ على حجم الفيديو، لذلك لا تستبدلها.
