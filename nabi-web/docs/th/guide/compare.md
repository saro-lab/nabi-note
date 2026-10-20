---
title: เปรียบเทียบ
description: เปรียบเทียบเอกสารสองฉบับเคียงกัน แล้วนำเนื้อหาเดิมที่เลือกมาใช้ในเอกสารปัจจุบัน
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# เปรียบเทียบ

วางเอกสารที่บันทึกไว้สองฉบับเคียงกันเพื่อดูการเปลี่ยนแปลง เปิดหน้าจอได้โดยไม่มีตัวแก้ไข และเชื่อม callback เพื่อนำเนื้อหาเดิมที่เลือกมาใช้ในเอกสารปัจจุบันได้

## นำเนื้อหาเดิมที่เลือกมาใช้

หน้าจอเปรียบเทียบแยกต่างหากมีค่าเริ่มต้นเป็นอ่านอย่างเดียว และไม่แสดงปุ่มนำไปใช้ **&gt;&gt;** เชื่อมต่อ callback `onMerge` เพื่อแสดงปุ่มเหล่านี้

ซ้ายคือเอกสารเดิม ขวาคือเอกสารปัจจุบัน กด **&gt;&gt;** ข้างการเปลี่ยนแปลงเพื่อนำเนื้อหาเดิมของย่อหน้าหรือกลุ่มบรรทัดนั้นมาใช้ ไม่ใช่การเลือกทีละตัวอักษร สามารถกู้เนื้อหาที่ลบหรือเอาเนื้อหาที่เพิ่มใหม่ออกได้ด้วย

ตัวอย่างด้านล่างอ่านได้อย่างเดียว ลองดูว่าเวลานัดและสิ่งที่ต้องนำมาเปลี่ยนไปอย่างไร **เริ่มใหม่** จะคืนตัวอย่างเดิม

<CompareDemo />

## หน้าจอเปรียบเทียบอิสระ

นำเข้าจาก `nabi-note/diff` ส่ง NABI TREE JSON ที่บันทึกไว้หรือสตริง HTML ให้ `before` และ `after` สร้าง registry ด้วย wing เดียวกับตัวแก้ไขที่สร้างเอกสาร เพื่ออ่านและแสดงตาราง รายการ รูปภาพและเนื้อหาอื่นได้ครบ

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'th',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

ค่าเริ่มต้นแสดงเฉพาะส่วนเปลี่ยนและบริบทรอบข้าง ปุ่มพับใช้เปิดเอกสารเต็ม ปุ่มก่อนหน้า/ถัดไปใช้ไปยังการเปลี่ยนแปลง หากไม่มีการเปลี่ยนจะแสดงทั้งเอกสาร ถ้าไม่ใส่ `onMerge` จะอ่านได้อย่างเดียว

## เชื่อมการรวมด้วยคลิกผ่าน callback

เมื่อคลิกจะส่งผลลัพธ์ที่เสนอให้ `onMerge` การเชื่อม callback อย่างเดียวไม่ได้บันทึกอัตโนมัติ บริการต้องรับข้อเสนอและเรียก `update()` จึงจะเปลี่ยนผลการเปรียบเทียบ

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'th',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` คือ NABI TREE JSON ที่ใช้เฉพาะการเปลี่ยนที่เลือก `before` และ `after` คือเอกสารขณะคลิก `changeId` ระบุการเปลี่ยน และ `revision` ระบุสถานะการเปรียบเทียบ ส่ง `revision` นี้เป็นอาร์กิวเมนต์ที่สามของ `update()` หากการเปรียบเทียบเปลี่ยนไปแล้วจะคืน `false` และไม่ใช้ข้อเสนอ

ระหว่างรอ callback แบบอะซิงโครนัสจะป้องกันการคลิกซ้ำ การอัปเดตเป็นเอกสารอื่นหรือถอดหน้าจอจะยกเลิก `signal` เมื่อบันทึกลงเซิร์ฟเวอร์ให้ตรวจทั้งสัญญาณและรุ่นเอกสารบนเซิร์ฟเวอร์ เพื่อไม่ให้ผลเก่าทับเอกสารใหม่

## เปิดการเปรียบเทียบจากตัวแก้ไข

เชื่อม wing `diff` กับ `mountDiffWing()` เพื่อเปิดจากแถบเครื่องมือ ฐานคือเอกสารที่โหลดล่าสุด การแก้ไขทั่วไปและเลิกทำไม่เปลี่ยนฐาน

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'th',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

`merge` มีค่าเริ่มต้นเป็น `true` จึงนำเนื้อหาเดิมที่เลือกไปใช้ในตัวแก้ไขได้ การเปลี่ยนแปลงนี้เลิกทำได้และยังเก็บเอกสารฐานไว้ หากตัวแก้ไขต้นฉบับเปลี่ยนขณะเปิดการเปรียบเทียบ จะคำนวณใหม่ กำหนด `merge: false` เพื่อเปรียบเทียบแบบอ่านอย่างเดียว

เรียก `toolbar.unmount()` และ `comparison.unmount()` เมื่อเอาหน้าจอออก หากต้องการใช้รุ่นเริ่มแก้ไขและรวมการเปลี่ยนทั้งสองฝ่ายอัตโนมัติ ให้ใช้ [รวม](./merge)
