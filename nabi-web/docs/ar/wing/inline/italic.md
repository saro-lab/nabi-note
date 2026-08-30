---
title: مائل
description: اجعل النص المحدد مائلاً.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# مائل

يجعل النص المحدد مائلاً. تطبيقه مرة أخرى على النطاق نفسه يزيل التنسيق، وتبقى العلامة محفوظة في المستندات.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
