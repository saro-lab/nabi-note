---
title: زیرنویس
description: متن انتخاب‌شده را زیر baseline ببرید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# زیرنویس

متن انتخاب‌شده را کوچک‌تر و پایین‌تر از خط زمینه نمایش می‌دهد. برای نگارشی که به زیرنویس نیاز دارد، مانند فرمول شیمیایی `H₂O`، مناسب است. این قالب‌بندی قابلیت محاسبهٔ فرمول اضافه نمی‌کند؛ از آن برای حفظ خودِ نگارش استفاده کنید.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
