---
title: ขีดทับ
description: แสดงเส้นขีดทับบนค่าที่ลบหรือเนื้อหาก่อนแก้ไข
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ขีดทับ

ขีดเส้นผ่านกลางข้อความที่เลือก ใช้เก็บถ้อยคำที่เปลี่ยนไปหรือเนื้อหาที่ไม่ใช้แล้วให้ยังมองเห็นโดยไม่ลบออก ใช้ซ้ำกับช่วงเดิมเพื่อยกเลิกรูปแบบ

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
