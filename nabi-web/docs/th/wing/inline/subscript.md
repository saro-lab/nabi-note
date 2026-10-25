---
title: ตัวห้อย
description: แสดงข้อความขนาดเล็กใต้เส้นฐาน เช่น ในสูตรเคมี
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ตัวห้อย

แสดงข้อความที่เลือกด้วยขนาดเล็กลงใต้เส้นฐาน เหมาะกับสัญลักษณ์ที่ต้องใช้ตัวห้อย เช่น สูตรเคมี `H₂O` รูปแบบนี้ไม่ได้เพิ่มความสามารถในการคำนวณสูตร ใช้เพื่อรักษารูปแบบการเขียนเท่านั้น

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
