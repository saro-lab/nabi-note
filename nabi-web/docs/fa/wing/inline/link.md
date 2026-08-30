---
title: پیوند
description: نشانی‌های امن وب را وصل کنید و پیوست‌های بارگذاری‌شده را نشان دهید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# پیوند

متن را انتخاب کنید و نشانی را به آن پیوست کنید. اگر بدون انتخاب متن نشانی وارد کنید، خود نشانی به‌عنوان متن پیوند وارد می‌شود. نوشتن نشانی `http://` یا `https://` و سپس زدن Space یا Enter نیز آن را به پیوند تبدیل می‌کند.

پیوندها فقط `http:`، `https:` و مسیرهای همان سایت را که با `.` یا `/` آغاز می‌شوند ذخیره می‌کنند. نشانی‌هایی با مبدأ نامشخص، مانند `javascript:` یا `//example.com`، پذیرفته نمی‌شوند. پیوندهای پیوست که بارگذاری می‌سازد نیز اطلاعات پرونده را نگه می‌دارند و مانند پیوندهای عادی دستی ساخته نمی‌شوند.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## استایل‌های CSS

پیوندهای عادی را با `.nabi-content a` و پیوندهای پیوست را جداگانه با `.nabi-content a[data-nabi-file]` سبک‌دهی کنید.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

بخش‌های `::before` و `::after` در پیوندهای پیوست برای نمایش نماد و پسوند پرونده به‌کار می‌روند؛ بنابراین معمولاً بهتر است `content` آن‌ها را جایگزین یا حذف نکنید.
