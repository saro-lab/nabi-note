---
title: سب اسکرپٹ
description: منتخب متن کو baseline سے نیچے کریں۔
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# سب اسکرپٹ

منتخب متن کو بنیادی لکیر کے نیچے چھوٹے حجم میں دکھاتا ہے۔ یہ کیمیائی فارمولے `H₂O` جیسی تحریر کے لیے موزوں ہے جس میں زیریں حروف درکار ہوں۔ یہ وضع فارمولوں کا حساب نہیں کرتی؛ اسے تحریر کی شکل محفوظ رکھنے کے لیے استعمال کریں۔

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
