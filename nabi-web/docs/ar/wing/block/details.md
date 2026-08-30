---
title: كتلة قابلة للطي
description: تجمع ملخصًا ومحتوى وتحفظ حالة الفتح الأولية.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# كتلة قابلة للطي

تجمع ملخصًا قصيرًا ومحتوى في كتلة واحدة. عند إنشائها من شريط الأدوات، اكتب الملخص أولًا ثم تابع كتابة المحتوى تحته.

تُحفظ حالة الفتح التي يحددها المثلث في المستند وتصبح الحالة الأولية في صفحة النشر. أثناء التحرير يبقى المحتوى مفتوحًا لتعديله، من دون تغيير قيمة الحالة المحفوظة.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## أنماط CSS

يمكن تنسيق الكتلة عبر `.nabi-content details` وعنوانها عبر `.nabi-content details > summary`.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

تمثل السمة `open` حالة الفتح الأولية التي حفظها الكاتب. يمكن لـCSS تنسيق الحالة، لكن يُفضّل ألا تفرض تغييرها.
