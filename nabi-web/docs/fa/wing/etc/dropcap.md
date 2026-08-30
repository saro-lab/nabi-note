---
title: حرف آغازین بزرگ
description: متن بدنه را با حرف اول بزرگ آغاز کنید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# حرف آغازین بزرگ

حرف اول پاراگراف را با اندازهٔ بزرگ‌تر قرار دهید و بگذارید خط‌های بعدی در کنار آن جریان یابند. این قالب‌بندی در سطح پاراگراف است؛ پس فقط به بخشی از یک واژهٔ انتخاب‌شده اعمال نمی‌شود.

نمای منتشرشده و نمای ویرایش شکل یکسانی دارند. هنگام ویرایش، حرف نخست در یک عنصر واقعی قرار می‌گیرد تا جایگاه‌های caret و حذف جابه‌جا نشوند؛ آن عنصر در محتوای ذخیره‌شدهٔ سند نمی‌آید.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## سبک‌های CSS

نمای منتشرشده و نمای ویرایش برای حرف اول selectorهای متفاوتی دارند. نمای منتشرشده از `[data-nabi-dropcap="1"]::first-letter` و نمای ویرایش از عنصر واقعی `[data-nabi-dropcap-letter]` استفاده می‌کند. هنگام تغییر مقادیر دیداری مانند رنگ، قلم یا اندازه، هر دو selector را با هم بنویسید تا ویرایش و خروجی منتشرشده یکسان دیده شوند.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

اگر اندازه و ارتفاع خط را تغییر می‌دهید، همان مقدارها را برای هر دو selector اعمال کنید.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

حرف‌های آغازین بزرگ جریان خط پیرامون حرف اول را محاسبه می‌کنند؛ پس تغییر دادن تنها یک طرف یا بسیار بزرگ کردن مقدارها می‌تواند شکل WYSIWYG را خراب کند. با این حال، از افزودن قاعدهٔ `::first-letter` تازه به ویرایشگر پرهیز کنید. در ویرایشگر فقط `[data-nabi-dropcap-letter]` موجود را سبک‌دهی کنید.
