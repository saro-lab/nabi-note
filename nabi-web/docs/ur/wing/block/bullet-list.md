---
title: بلٹ فہرست
description: متعدد آئٹمز کو بغیر ترتیب کے فہرست میں لائیں۔
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# بلٹ فہرست

یہ متعدد آئٹمز کو بغیر ترتیب کے فہرست میں لاتی ہے۔ خالی پیراگراف میں `-` کے بعد Space دبائیں یا ٹول بار سے اسے تبدیل کریں۔ منتخب پیراگرافوں کو بھی ایک ساتھ فہرست میں شامل کیا جا سکتا ہے۔

فہرست میں Tab سے ایک سطح اندر جائیں اور Shift+Tab سے باہر آئیں۔ Enter اگلا آئٹم بناتا ہے، اور خالی آئٹم میں دوبارہ Enter دبانے سے فہرست ختم ہو جاتی ہے۔

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
