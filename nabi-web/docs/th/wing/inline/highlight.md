---
title: ปากกาเน้นข้อความ
description: ลงสีเน้นที่อนุญาตไว้ด้านหลังข้อความที่เลือก
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ปากกาเน้นข้อความ

ลงสีเน้นที่ด้านหลังข้อความที่เลือก ข้อมูลที่บันทึกจะเก็บเฉพาะชื่อสีที่อนุญาตแทนค่า CSS สีใด ๆ จึงแยกสไตล์หน้าจอออกจากข้อมูลเอกสารได้

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

หากไม่ระบุ `values` จะใช้ `yellow`, `green`, `cyan`, `pink`, `purple`, `orange` เมื่อจำกัดรายการ สีที่ไม่ได้ลงทะเบียนจะไม่คงอยู่แม้ในเอกสารที่โหลดมา

## รูปแบบ CSS

เอกสารเก็บเพียงชื่อสี เปลี่ยนสีของเอดิเตอร์และหน้าที่เผยแพร่ด้วยตัวแปร CSS

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

เมื่อเปลี่ยนหลายสีพร้อมกัน สามารถเปลี่ยนบรรยากาศของบริการได้โดยคงชื่อสีในเอกสารไว้

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
