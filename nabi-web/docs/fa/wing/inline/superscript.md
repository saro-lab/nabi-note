---
title: بالانویس
description: متن انتخاب‌شده را بالای baseline ببرید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# بالانویس

متن انتخاب‌شده را کوچک‌تر و بالاتر از خط زمینه نمایش می‌دهد. برای توان‌ها یا نشانه‌های پاورقی کاربرد دارد و فقط روی محدودهٔ انتخاب‌شده اعمال می‌شود.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
