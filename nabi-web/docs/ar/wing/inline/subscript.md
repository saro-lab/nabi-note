---
title: نص سفلي
description: اخفض النص المحدد تحت خط الأساس.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# نص سفلي

يخفض النص المحدد تحت خط الأساس للصيغ الكيميائية والفهارس. تطبيقه مرة أخرى يزيل التنسيق.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
