---
title: يتوسطه خط
description: اشطب النص المحدد.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# يتوسطه خط

يرسم خطًا في وسط النص المحدد. يمكن استخدامه لإبقاء العبارات المعدّلة أو المحتوى الذي لم يعد صالحًا ظاهرًا دون حذفه. تطبيقه مرة أخرى على النطاق نفسه يزيل التنسيق.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
