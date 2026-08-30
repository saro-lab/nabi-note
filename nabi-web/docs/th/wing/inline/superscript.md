---
title: ตัวยก
description: แสดงข้อความขนาดเล็กเหนือเส้นฐาน เช่น เชิงอรรถและเลขยกกำลัง
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ตัวยก

แสดงข้อความที่เลือกให้มีขนาดเล็กเหนือเส้นฐาน ใช้กับเลขยกกำลังหรือเครื่องหมายเชิงอรรถได้ และใช้เฉพาะกับช่วงที่เลือกเท่านั้น

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
