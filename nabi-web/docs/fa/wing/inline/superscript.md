---
title: بالانویس
description: متن انتخاب‌شده را بالای baseline ببرید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# بالانویس

برای توان‌ها و نشانگرهای ارجاع، متن انتخاب‌شده را بالای baseline می‌برد. اعمال دوباره قالب‌بندی را حذف می‌کند.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
