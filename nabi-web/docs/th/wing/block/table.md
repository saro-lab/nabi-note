---
title: ตาราง
description: สร้างแถวและคอลัมน์ พร้อมรองรับการแก้ไขเซลล์และการเรียงคอลัมน์
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ตาราง

เลือกจำนวนแถวและคอลัมน์จากแถบเครื่องมือเพื่อสร้างตาราง ภายในเซลล์ ให้เขียนเนื้อหาต่อด้วยการขึ้นบรรทัดใหม่แทนการใช้หลายย่อหน้า และกด Tab กับ Shift+Tab เพื่อย้ายไปยังเซลล์ถัดไปหรือก่อนหน้า

การเพิ่มหรือลบแถวและคอลัมน์ การรวมเซลล์ และการเปลี่ยนเป็นเซลล์หัวเรื่อง ทำงานตามเซลล์ที่เลือก หลังเก็บตารางให้เรียงได้แล้ว หากต้องการเรียงคอลัมน์ในหน้าที่เผยแพร่ ต้องเชื่อมต่อ `attachViewer()` ของ `nabi-note/viewer` ตารางที่มีเซลล์รวมไม่ใช่เป้าหมายของการเรียงคอลัมน์

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## รูปแบบ CSS

จัดรูปแบบตารางด้วย `.nabi-content table` และเซลล์ด้วย `.nabi-content :is(th, td)` อย่าเปลี่ยนโครงสร้างของเซลล์หรือปุ่มเรียงที่ viewer เพิ่ม

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

หากเชื่อมต่อ viewer แล้ว ให้คงปุ่ม `.nabi-sort` ไว้ การเขียนทับ `position` หรือ padding ด้านขวาของเซลล์แบบบังคับอาจทำให้ทับกับปุ่มเรียง
