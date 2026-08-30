---
title: قائمة نقطية
description: تسرد عدة عناصر من دون ترتيب رقمي.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# قائمة نقطية

تنشئ قائمة بعناصر غير مرقمة. في فقرة فارغة، اكتب `-` ثم اضغط Space، أو حوّل الفقرات من شريط الأدوات. ويمكن جمع الفقرات المحددة في قائمة دفعة واحدة.

داخل القائمة، يزيد Tab مستوى المسافة البادئة ويقلله Shift+Tab. ينشئ Enter العنصر التالي، والضغط عليه مرة أخرى في عنصر فارغ ينهي القائمة.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
