---
title: رنگ متن
description: یک نام رنگ مجاز روی متن انتخاب‌شده اعمال کنید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# رنگ متن

یک نام رنگ مجاز روی متن انتخاب‌شده اعمال کنید. مقدار ذخیره‌شده رشتهٔ رنگ CSS نیست؛ نامی مجاز است و رنگ واقعی را متغیر CSS با نام `--nabi-tc-<name>` تعیین می‌کند. به این ترتیب، همان سند در هر دو پوستهٔ روشن و تیره خوانا می‌ماند.

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

اگر `values` حذف شود، پالت پیش‌فرض `green`، `coral`، `violet`، `amber` و `blue` است. اگر فهرست را کوچک کنید، رنگ‌های دیگر در فرمان‌ها و هنگام بارگیری سند پذیرفته نمی‌شوند.

## استایل‌های CSS

سند فقط نام رنگ را ذخیره می‌کند. رنگ واقعی ویرایشگر و نمای منتشرشده را با متغیرهای CSS تنظیم کنید.

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

کنتراست را همراه رنگ پس‌زمینه بررسی کنید. در پوستهٔ تیره، یک نام رنگ می‌تواند مقدار متفاوتی بگیرد.

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
