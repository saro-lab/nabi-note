---
title: نص سفلي
description: اخفض النص المحدد تحت خط الأساس.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# نص سفلي

يعرض النص المحدد بحجم أصغر أسفل خط الأساس. يناسب الرموز التي تحتاج إلى أحرف سفلية، مثل الصيغة الكيميائية `H₂O`. لا يضيف هذا التنسيق حساب المعادلات؛ استخدمه للحفاظ على طريقة كتابة الرموز نفسها.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
