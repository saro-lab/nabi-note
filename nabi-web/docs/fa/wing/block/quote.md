---
title: نقل‌قول
description: متن نقل‌قول را گروه‌بندی کنید یا زمینه را در چند پاراگراف جدا سازید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# نقل‌قول

متن نقل‌قول را گروه‌بندی کنید یا زمینه را در چند پاراگراف جدا سازید. در پاراگراف خالی `>` و سپس Space را بنویسید، یا پاراگراف‌های انتخاب‌شده را از نوارابزار به نقل‌قول تبدیل کنید.

نقل‌قول می‌تواند افزون بر پاراگراف‌های عادی، بلوک‌هایی مانند فهرست و تصویر را در بر بگیرد. تبدیل دوبارهٔ همان بازه، آن را به پاراگراف‌های بیرونی بازمی‌گرداند.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## سبک‌های CSS

با تغییر کادر و فاصله‌ها، نقل‌قول‌ها را با `.nabi-content blockquote` سبک‌دهی کنید.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

ساختار پاراگراف‌ها را درون `blockquote` حفظ کنید و فقط نمایش، مانند فاصلهٔ بیرونی، کادر و رنگ را تغییر دهید.
