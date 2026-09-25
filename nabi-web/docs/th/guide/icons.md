---
title: "ธีมไอคอน"
description: "ใช้ตัวแปร CSS เปลี่ยนไอคอนของ wing ตัวอย่าง เต็มหน้าจอ แผง การเปรียบเทียบ และการเรียงตาราง ใช้ SVG, WebP และ PNG ร่วมกันได้ ไอคอนที่ไม่ได้กำหนดจะใช้ไฟล์เริ่มต้น"
---

# ธีมไอคอน

ใช้ตัวแปร CSS เปลี่ยนไอคอนของ wing ตัวอย่าง เต็มหน้าจอ แผง การเปรียบเทียบ และการเรียงตาราง ใช้ SVG, WebP และ PNG ร่วมกันได้ ไอคอนที่ไม่ได้กำหนดจะใช้ไฟล์เริ่มต้น

## กำหนดไฟล์

โหลด CSS แล้วเพิ่มคลาสธีมให้ตัวแก้ไขหรือองค์ประกอบแม่ร่วม รูปภาพจะคงสี ความโปร่งใส และสัดส่วนเดิม

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

ใช้เส้นทางจากราก เช่น `/icons/...` หรือ URL HTTPS แบบเต็ม ไม่รับประกันว่าเส้นทางสัมพัทธ์จะอ้างอิงจากข้างไฟล์ธีม หากโฮสต์ CSS เอง ให้คัดลอก `dist/icons/` เวอร์ชันเดียวกันไว้ข้าง `nabi.css` หากโหลดภาพไม่สำเร็จ ไอคอนจะว่าง แต่ชื่อปุ่ม คำแนะนำ และการทำงานยังใช้ได้

## ค้นหาไอคอนอื่น

เติม `--nabi-icon-` หน้าค่า `data-nabi-icon` ขององค์ประกอบไอคอนเพื่อได้ตัวแปร CSS เช่น `diff-close` ใช้ `--nabi-icon-diff-close` ดูกฎคีย์บริบท เมนู บันทึก ประวัติ และอื่น ๆ รวมถึงการเข้ารหัสอักขระพิเศษได้ที่<a href="/llms/icons.md" target="_blank" rel="noopener">ข้อตกลงไอคอน</a>

## โหมดมืดและแผง

เปลี่ยนคลาสธีมหรือตัวแปร CSS แล้วไอคอนจะอัปเดตโดยไม่ต้อง mount ใหม่ ไอคอนเริ่มต้นตามธีมสว่าง/มืด ไฟล์กำหนดเองไม่สืบทอด `currentColor` จึงควรกำหนดไฟล์โหมดมืดตามตัวอย่างเมื่อจำเป็น แผงที่เปิดใต้ `body` จะตามธีมไอคอนและการเปลี่ยนคลาส/สไตล์ของตัวแก้ไขต้นทางด้วย วางตัวแปรบนตัวแก้ไขหรือองค์ประกอบแม่ร่วม ไม่ใช่เฉพาะภายในแถบเครื่องมือ

## แสดงปุ่มเริ่มต้น

`showPreview` และ `showFullscreen` มีค่าเริ่มต้นเป็น `true` ทั้งคู่ ค่า `false` จะนำปุ่มนั้น เป้าหมายโฟกัส และอีเวนต์ออก หากทั้งคู่เป็น `false` จะไม่สร้างพื้นที่เครื่องมือว่างด้วย

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

ส่งตัวเลือกการแสดงเดียวกันให้ SSR และ mount หากเปลี่ยนการตั้งค่า ให้เรียก `tools.unmount()` แล้ว mount ด้วยตัวเลือกใหม่ หากไม่ต้องใช้ทั้งสองปุ่ม ยังสามารถละการ mount เครื่องมือและมาร์กอัป SSR ทั้งหมดได้ การเรียก `openPreview()` และ `setFullscreen()` โดยตรงยังคงใช้ได้
