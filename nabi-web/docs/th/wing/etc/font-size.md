---
title: ขนาดตัวอักษร
description: เปลี่ยนขนาดตัวอักษรภายในขั้นที่อนุญาต
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ขนาดตัวอักษร

เปลี่ยนขั้นขนาดของข้อความที่เลือก หากเลือกเป็นช่วง จะใช้กับช่วงนั้น หากมีเพียงเคอร์เซอร์ จะเปลี่ยนขนาดตัวอักษรของย่อหน้าปัจจุบัน ข้อมูลที่บันทึกจะเก็บเฉพาะขั้นที่อนุญาต ไม่ใช่ค่าอิสระอย่าง `px`

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

หากละ `values` ไว้ จะใช้ขั้น `xs`, `sm`, `lg` และ `xl` หากจำกัดรายการให้แคบลง ขั้นอื่นที่มีอยู่ในเอกสารเดิมจะถูกนำออกเมื่อโหลด

## สไตล์ CSS

คุณเปลี่ยนขนาดได้ผ่านตัวเลือกขั้นที่บันทึกไว้ เช่น `.nabi-content [data-nabi-size="xs"]` อย่าสร้างขั้นอิสระที่ไม่มีในเอกสาร ให้ปรับ CSS เฉพาะภายใน `values` ที่ลงทะเบียนไว้

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

การรักษาความต่างของขนาดระหว่างแต่ละขั้นให้สม่ำเสมอ จะคงความหมายที่ผู้เขียนเลือกในตัวแก้ไขไว้เมื่อเอกสารถูกเผยแพร่
