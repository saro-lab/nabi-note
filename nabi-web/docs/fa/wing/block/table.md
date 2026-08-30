---
title: جدول
description: سطر و ستون بسازید، خانه‌ها را ویرایش کنید و مرتب‌سازی ستون را پشتیبانی کنید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# جدول

برای ساخت جدول، سطر و ستون را از نوارابزار انتخاب کنید. درون خانه، محتوا با شکست خط ادامه می‌یابد نه با چند پاراگراف؛ Tab و Shift+Tab به خانهٔ بعدی یا قبلی می‌روند.

افزودن و حذف سطر یا ستون، ادغام خانه‌ها و تغییر وضعیت خانه‌های سرستون پیرامون خانه‌های انتخاب‌شده انجام می‌شود. برای مرتب‌سازی ستون در نمای منتشرشده، پس از ذخیرهٔ جدول به‌صورت قابل‌مرتب‌سازی، `attachViewer()` را از `nabi-note/viewer` متصل کنید. جدول‌های دارای خانه‌های ادغام‌شده مرتب نمی‌شوند.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## سبک‌های CSS

جدول را با `.nabi-content table` و خانه‌ها را با `.nabi-content :is(th, td)` سبک‌دهی کنید. ساختار خانه‌ها یا دکمهٔ مرتب‌سازیِ افزوده‌شده توسط viewer را تغییر ندهید.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

اگر viewer متصل است، دکمهٔ `.nabi-sort` را نگه دارید. بازنویسی اجباری `position` یا padding سمت راست خانه می‌تواند روی دکمهٔ مرتب‌سازی بیفتد.
