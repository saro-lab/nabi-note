---
title: غامق
description: اجعل النص المحدد غامقاً.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# غامق

يجعل النص المحدد غامقاً. تطبيقه مرة أخرى على النطاق نفسه يزيل التنسيق. تبقى العلامة مرتبطة بالنص في المستندات المحفوظة.

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
