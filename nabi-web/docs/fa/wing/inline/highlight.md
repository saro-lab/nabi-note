---
title: هایلایت
description: یک رنگ highlight مجاز پشت متن انتخاب‌شده اعمال کنید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# هایلایت

یک رنگ برجسته‌سازی مجاز پشت متن انتخاب‌شده اعمال کنید. دادهٔ ذخیره‌شده فقط نام رنگ‌های مجاز را نگه می‌دارد، نه مقدارهای آزاد رنگ CSS؛ پس دادهٔ سند و سبک دیداری جدا می‌مانند.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

اگر `values` حذف شود، پالت پیش‌فرض `yellow`، `green`، `cyan`، `pink`، `purple` و `orange` است. اگر فهرست را محدود کنید، رنگ‌های ثبت‌نشده حتی هنگام بارگیری سند پیشین نیز نگه داشته نمی‌شوند.

## استایل‌های CSS

سند فقط نام رنگ‌ها را ذخیره می‌کند. رنگ‌های ویرایشگر و نمای منتشرشده را با متغیرهای CSS تغییر دهید.

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

با تغییر هم‌زمان چند رنگ، نام‌های رنگ سند ثابت می‌مانند و فقط حال‌وهوای محصول تنظیم می‌شود.

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
