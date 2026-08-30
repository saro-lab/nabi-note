---
title: نص علوي
description: ارفع النص المحدد فوق خط الأساس.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# نص علوي

يرفع النص المحدد فوق خط الأساس للأسس وعلامات المراجع. تطبيقه مرة أخرى يزيل التنسيق.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
