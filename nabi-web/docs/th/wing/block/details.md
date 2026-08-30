---
title: พับเก็บ
description: รวมสรุปและเนื้อหาเข้าด้วยกัน และเก็บสถานะการเปิดเริ่มต้น
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# พับเก็บ

รวมสรุปสั้น ๆ และเนื้อหาไว้ในบล็อกเดียว เมื่อสร้างจากแถบเครื่องมือ ให้พิมพ์สรุปก่อน แล้วจึงเขียนเนื้อหาต่อด้านล่าง

สถานะการเปิดที่กำหนดด้วยสามเหลี่ยมจะถูกบันทึกในเอกสารและกลายเป็นสถานะเริ่มต้นของหน้าที่เผยแพร่ ขณะแก้ไข เนื้อหาจะถูกเปิดไว้เพื่อให้แก้ได้ แต่ค่าสถานะที่บันทึกยังคงเดิม

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## รูปแบบ CSS

จัดรูปแบบบล็อกพับเก็บด้วย `.nabi-content details` และหัวข้อด้วย `.nabi-content details > summary`

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

แอตทริบิวต์ `open` คือสถานะเปิดเริ่มต้นที่ผู้เขียนบันทึกไว้ CSS สามารถจัดรูปแบบสถานะนี้ได้ แต่ไม่ควรบังคับเปลี่ยนสถานะ
