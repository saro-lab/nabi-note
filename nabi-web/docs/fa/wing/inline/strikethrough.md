---
title: خط‌خورده
description: روی متن انتخاب‌شده خط بکشید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# خط‌خورده

روی متن انتخاب‌شده خط می‌کشد. اعمال دوباره روی همان بازه قالب‌بندی را حذف می‌کند و mark در سندهای ذخیره‌شده حفظ می‌شود.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
