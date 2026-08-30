---
title: خط فاصل
description: يدرج خطًا أفقيًا يقسم مسار المستند.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# خط فاصل

هو خط أفقي يقسم مسار المستند. في فقرة فارغة، اكتب ثلاث شرطات أو أكثر ثم اضغط Enter، أو أدرجه من شريط الأدوات.

الخط الفاصل كتلة مستقلة بلا نص، لذلك لا يحمل تنسيقات مثل العنوان أو اللون. استخدمه فقط للفصل بين الفقرات التي قبله وبعده.

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
