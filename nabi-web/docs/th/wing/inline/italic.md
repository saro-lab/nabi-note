---
title: ตัวเอียง
description: แสดงข้อความที่เลือกเป็นตัวเอียงเพื่อแยกจากเนื้อหา
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ตัวเอียง

แสดงข้อความที่เลือกเป็นตัวเอียง เหมาะสำหรับแยกชื่อผลงานหรือคำภาษาต่างประเทศออกจากเนื้อความเล็กน้อย กดอีกครั้งในช่วงที่เป็นตัวเอียงอยู่แล้วเพื่อยกเลิกรูปแบบ

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
