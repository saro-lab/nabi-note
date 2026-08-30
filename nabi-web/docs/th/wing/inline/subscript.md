---
title: ตัวห้อย
description: แสดงข้อความขนาดเล็กใต้เส้นฐาน เช่น ในสูตรเคมี
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ตัวห้อย

แสดงข้อความที่เลือกให้มีขนาดเล็กใต้เส้นฐาน เหมาะกับสัญลักษณ์ที่ต้องใช้ตัวห้อย เช่น `H₂O` ในสูตรเคมี ไม่ใช่รูปแบบที่เพิ่มความสามารถในการคำนวณสมการ จึงใช้เมื่อต้องการเก็บลักษณะการแสดงผลไว้

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
