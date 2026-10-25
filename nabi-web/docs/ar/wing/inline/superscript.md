---
title: نص علوي
description: ارفع النص المحدد فوق خط الأساس.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# نص علوي

يعرض النص المحدد بحجم أصغر أعلى خط الأساس. يمكن استخدامه للأسس أو علامات الحواشي، ويُطبّق على النطاق المحدد فقط.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
