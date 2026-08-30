---
title: جزئیات
description: خلاصه و بدنه را گروه‌بندی کنید و باز بودن آغازین آن را ذخیره کنید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# جزئیات

یک خلاصهٔ کوتاه و بدنه را در یک بلوک گروه‌بندی کنید. هنگام ساختن آن از نوارابزار، ابتدا خلاصه را وارد می‌کنید و سپس نوشتن را در زیر آن ادامه می‌دهید.

وضعیت باز بودنِ تعیین‌شده با مثلث در سند ذخیره می‌شود و در نمای منتشرشده وضعیت آغازین خواهد بود. هنگام ویرایش، بدنه برای امکان تغییر باز نگه داشته می‌شود، اما مقدار وضعیت ذخیره‌شده حفظ می‌شود.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## سبک‌های CSS

بلوک جزئیات را با `.nabi-content details` و عنوان را با `.nabi-content details > summary` سبک‌دهی کنید.

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

ویژگی `open` وضعیت باز بودن آغازینی است که نویسنده ذخیره کرده است. CSS می‌تواند این وضعیت را سبک‌دهی کند، اما بهتر است خودِ وضعیت را اجبار نکنید.
