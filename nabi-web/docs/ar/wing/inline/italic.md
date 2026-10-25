---
title: مائل
description: اجعل النص المحدد مائلاً.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# مائل

يعرض النص المحدد بخط مائل. يفيد ذلك في تمييز عناوين الأعمال أو الكلمات الأجنبية قليلًا عن متن النص. اضغط مرة أخرى على نطاق مائل لإزالة التنسيق.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
