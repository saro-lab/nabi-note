---
title: يتوسطه خط
description: اشطب النص المحدد.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# يتوسطه خط

يشطب النص المحدد. تطبيقه مرة أخرى على النطاق نفسه يزيل التنسيق، وتبقى العلامة محفوظة في المستندات.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
