---
title: زیرخط
description: زیر متن انتخاب‌شده خط بکشید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# زیرخط

زیر متن انتخاب‌شده خط می‌کشد. اعمال دوباره روی همان بازه قالب‌بندی را حذف می‌کند و mark در سندهای ذخیره‌شده حفظ می‌شود.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
