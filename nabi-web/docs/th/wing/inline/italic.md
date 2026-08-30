---
title: ตัวเอียง
description: แสดงข้อความที่เลือกเป็นตัวเอียงเพื่อแยกจากเนื้อหา
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ตัวเอียง

แสดงข้อความที่เลือกเป็นตัวเอียง เหมาะสำหรับแยกน้ำหนักจากเนื้อหาเล็กน้อย เช่น ชื่อผลงานหรือภาษาต่างประเทศ และกดอีกครั้งเพื่อเอาออกในช่วงที่เป็นตัวเอียงอยู่แล้ว

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
