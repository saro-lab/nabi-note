---
title: ตัวหนา
description: แสดงข้อความที่เลือกเป็นตัวหนา
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ตัวหนา

แสดงข้อความที่เลือกเป็นตัวหนา ใช้กับช่วงเดิมอีกครั้งเพื่อลบตัวหนาออก รูปแบบตัวหนาจะคงอยู่พร้อมข้อความในเอกสารที่บันทึกไว้ด้วย

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
