---
title: ขีดทับ
description: แสดงเส้นขีดทับบนค่าที่ลบหรือเนื้อหาก่อนแก้ไข
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ขีดทับ

ขีดเส้นผ่านกลางข้อความที่เลือก ใช้ได้เมื่ออยากเก็บข้อความที่เปลี่ยนไปหรือไม่ใช้แล้วไว้โดยไม่ลบทิ้ง และจะถูกเอาออกเมื่อใช้กับช่วงเดิมอีกครั้ง

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
