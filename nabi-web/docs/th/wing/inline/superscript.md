---
title: ตัวยก
description: แสดงข้อความขนาดเล็กเหนือเส้นฐาน เช่น เชิงอรรถและเลขยกกำลัง
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ตัวยก

แสดงข้อความที่เลือกด้วยขนาดเล็กลงเหนือเส้นฐาน ใช้สำหรับเลขชี้กำลังหรือเครื่องหมายเชิงอรรถได้ และมีผลเฉพาะช่วงที่เลือก

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
