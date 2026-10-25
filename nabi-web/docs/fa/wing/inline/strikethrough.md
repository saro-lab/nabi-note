---
title: خط‌خورده
description: روی متن انتخاب‌شده خط بکشید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# خط‌خورده

از میان متن انتخاب‌شده خطی می‌کشد. می‌توانید عبارت‌های تغییرکرده یا مطالبی را که دیگر معتبر نیستند بدون حذف کردن، نمایان نگه دارید. اعمال دوباره روی همان محدوده، قالب‌بندی را برمی‌دارد.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
