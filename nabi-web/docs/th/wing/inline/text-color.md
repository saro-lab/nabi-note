---
title: สีข้อความ
description: ใช้ชื่อสีที่อนุญาตกับข้อความที่เลือก
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# สีข้อความ

ใช้ชื่อสีกับข้อความที่เลือก ค่าที่บันทึกไม่ใช่สตริงสี CSS แต่เป็นชื่อที่อนุญาต และกำหนดสีจริงด้วยตัวแปร CSS `--nabi-tc-<name>` ดังนั้นเอกสารเดียวกันจึงปรับให้อ่านง่ายได้ทั้งในธีมสว่างและมืด

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

หากไม่ระบุ `values` จะใช้จานสีเริ่มต้น (`green`, `coral`, `violet`, `amber`, `blue`) เมื่อจำกัดรายการ สีอื่นจะไม่ถูกรับทั้งจากคำสั่งและการโหลด

## รูปแบบ CSS

เอกสารเก็บเพียงชื่อสี กำหนดสีจริงของเอดิเตอร์และหน้าที่เผยแพร่ด้วยตัวแปร CSS

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

ปรับสีข้อความพร้อมกับสีพื้นหลังเพื่อตรวจสอบความต่างของสี ในธีมมืด สามารถให้ค่าอื่นแก่ชื่อสีเดียวกันได้

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
