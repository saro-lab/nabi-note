---
title: ضخیم
description: متن انتخاب‌شده را ضخیم کنید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ضخیم

متن انتخاب‌شده را ضخیم می‌کند. اعمال دوباره روی همان بازه قالب‌بندی را حذف می‌کند. mark در سندهای ذخیره‌شده همراه متن می‌ماند.

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
