---
title: اقتباس
description: يجمع اقتباسًا أو سياقًا منفصلًا في عدة فقرات.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# اقتباس

يجمع اقتباسًا أو سياقًا منفصلًا في عدة فقرات. في فقرة فارغة، اكتب `>` ثم اضغط Space، أو حوّل الفقرات المحددة إلى اقتباس من شريط الأدوات.

يمكن أن يحتوي الاقتباس على فقرات عادية وكتل مثل القوائم والصور. ويؤدي تحويل النطاق نفسه مرة أخرى إلى إخراجه كفقرات عادية.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## أنماط CSS

يمكن تغيير حدود الاقتباس ومسافاته عبر `.nabi-content blockquote`.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

أبقِ بنية الفقرات داخل `blockquote` كما هي، وغيّر المظهر فقط، مثل الهامش الخارجي والحد واللون.
