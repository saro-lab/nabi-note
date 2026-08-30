---
title: اندازهٔ قلم
description: اندازهٔ متن را در گام‌های مجاز تغییر دهید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# اندازهٔ قلم

متن انتخاب‌شده را به یک گام اندازه تغییر دهید. اگر بازه‌ای انتخاب شده باشد، گام بر همان بازه اعمال می‌شود؛ اگر فقط caret وجود داشته باشد، اندازهٔ متن پاراگراف کنونی تغییر می‌کند. دادهٔ ذخیره‌شده فقط گام‌های مجاز را نگه می‌دارد، نه مقدارهای دلخواهی مانند `px`.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

اگر `values` حذف شود، گام‌های `xs`، `sm`، `lg` و `xl` به‌کار می‌روند. اگر فهرست را محدود کنید، گام‌های دیگری که از پیش در سندهای قدیمی هستند هنگام بارگذاری حذف می‌شوند.

## سبک‌های CSS

می‌توانید اندازه‌ها را با selectorهای گام ذخیره‌شده مانند `.nabi-content [data-nabi-size="xs"]` تغییر دهید. گام‌های دلخواهی که در سند نیستند نسازید؛ CSS را فقط در `values` ثبت‌شده تنظیم کنید.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

یکنواخت نگه‌داشتن تفاوت اندازه میان گام‌ها، معنایی را که نویسنده در ویرایشگر برگزیده است در سند منتشرشده حفظ می‌کند.
