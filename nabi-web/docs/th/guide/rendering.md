---
title: การตั้งค่า SSR
description: เรนเดอร์เอกสาร NABI TREE ที่บันทึกไว้เป็น HTML บนเซิร์ฟเวอร์อย่างปลอดภัย และ hydrate เครื่องมือแก้ไขในเบราว์เซอร์
---

# การตั้งค่า SSR

บนเซิร์ฟเวอร์ให้ import เฉพาะ `nabi-note/ssr` ไม่ใช่ surface หรือ UI สำหรับเบราว์เซอร์ โมดูลนี้ตรวจสอบ NABI TREE JSON ที่บันทึกไว้ และแปลงเป็น HTML สำหรับเผยแพร่หรือ HTML เครื่องมือแก้ไขที่ hydrate ได้

## เรนเดอร์ HTML สำหรับเผยแพร่

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('The stored document could not be read.')
```

`renderStoredHtml()` ตรวจสอบและทำ JSON อินพุตให้เป็นรูปแบบมาตรฐาน แล้วคืน HTML สำหรับเผยแพร่ `null` หมายถึง registry ปัจจุบันไม่สามารถอ่านอินพุตนั้นได้ ใส่ CSS ของแพ็กเกจและ `.nabi-content` ในหน้าที่เผยแพร่ด้วย

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

เพิ่ม `attachViewer()` จาก `nabi-note/viewer` ในเบราว์เซอร์เฉพาะเมื่อใช้การเรียงตารางแบบโต้ตอบหรือการเน้นโค้ด เนื้อหาที่เผยแพร่ทั่วไปต้องการเพียง CSS

## Hydrate มาร์กอัปเครื่องมือแก้ไขที่เรนเดอร์ไว้ล่วงหน้า

หากต้องการแสดงเครื่องมือแก้ไขตั้งแต่การวาดครั้งแรก ให้เรนเดอร์ด้วย `renderStoredEditorHtml()` บนเซิร์ฟเวอร์ แล้วส่ง `hydrate: true` ให้ surface บนเบราว์เซอร์

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

เซิร์ฟเวอร์และเบราว์เซอร์ต้องใช้เอกสารเดียวกัน ประกาศ wing ลำดับเดียวกัน และตัวเลือกที่มีผลต่อ HTML เหมือนกัน แทรกผลลัพธ์จากเซิร์ฟเวอร์โดยไม่เปลี่ยนแปลงเป็นลูกโดยตรงของ content root และอย่าตั้ง `contenteditable` ล่วงหน้าบน root นั้น หากโครงสร้างต่างกัน surface จะเรนเดอร์ HTML เครื่องมือแก้ไขใหม่

## เรนเดอร์แถบเครื่องมือล่วงหน้าด้วย

`renderToolbarHtml()` และ `renderViewToolsHtml()` สามารถเรนเดอร์ control ของแถบเครื่องมือล่วงหน้าบนเซิร์ฟเวอร์ได้ การ mount ในเบราว์เซอร์จะเชื่อม control เหล่านั้นเมื่อ registry locale และลำดับกลุ่มตรงกัน ไม่รองรับ host DOM ตามอำเภอใจภายใน toolbar root

อย่าใช้ API ของเบราว์เซอร์ เช่น `injectSheets()` ระหว่าง SSR ให้ลิงก์ไฟล์ `nabi-note/nabi.css` ที่ build แล้วหรือรวมไว้ใน CSS bundle ของคุณ
