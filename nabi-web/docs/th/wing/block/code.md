---
title: โค้ด
description: เก็บโค้ดหลายบรรทัดพร้อมข้อมูลภาษาสำหรับการเน้นไวยากรณ์
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# โค้ด

แทรกโค้ดหลายบรรทัดให้แยกจากเนื้อหาปกติ พิมพ์แบ็กทิกสามตัวในย่อหน้าว่างแล้วกด Space หรือ Enter หรือเปลี่ยนเป็นบล็อกโค้ดจากแถบเครื่องมือ หากเติมชื่อภาษาหลังแบ็กทิก เช่น `ts` ชื่อนั้นจะถูกเก็บไว้ด้วย

ชื่อภาษาเป็นตัวระบุที่ใช้สำหรับการเน้นไวยากรณ์ และยังพิมพ์ชื่อที่อยู่นอกบัญชีรายชื่อที่ลงทะเบียนได้เอง เนื่องจากต้องรักษาเนื้อหาโค้ดและการเยื้อง บล็อกโค้ดจึงไม่ใช้การจัดแนวย่อหน้า

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## การเชื่อมต่อ code highlighter

การลงทะเบียนบล็อกโค้ดจะใช้การลงสีเริ่มต้นในเอดิเตอร์ หากต้องการลงสีโค้ดในหน้าที่เผยแพร่ด้วย ให้เชื่อมต่อ `nabi-note/viewer` viewer จะค้นหา `pre > code` และอ่านค่า `data-nabi-lang` ขององค์ประกอบแม่เป็นชื่อภาษา หากไม่มีค่านั้น จะตรวจสอบคลาส `language-...` ขององค์ประกอบ `code`

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'th',
})

// หลังจากเปลี่ยน HTML ที่เผยแพร่
viewer.refresh()

// เมื่อปิดหน้าจอ
viewer.unmount()
```

หากไม่มี highlighter แยกต่างหาก หรือ highlighter นั้นจัดการภาษาดังกล่าวไม่ได้ ตัวแยกโทเคนในตัวที่ไม่ต้องพึ่งพาไลบรารีจะลงสีแทน span โทเคนที่ highlighter ใส่มีอยู่เฉพาะบนหน้าจอ และจะไม่ถูกเขียนกลับลง JSON ที่บันทึกหรือ HTML ต้นฉบับที่เผยแพร่ `refresh()` และ `unmount()` จะลบ span เหล่านั้น แล้วเชื่อมต่อใหม่จากโค้ดต้นฉบับปัจจุบัน

### วิธีที่เว็บไซต์ NABI เชื่อมต่อ Shiki

เว็บไซต์ NABI โหลด highlighter แบบไดนามิกเพื่อไม่ให้ Shiki อยู่ในหน้าจอแรกหรือบันเดิล SSR `loadCodeHighlighting()` ใน `nabi-web/docs/.vitepress/src/highlight.ts` สร้าง Shiki core แล้วดึงไวยากรณ์ของภาษาเฉพาะเมื่อจำเป็นต้องใช้โค้ดภาษานั้นจริง ๆ ตัวอย่างด้านล่างใช้การเชื่อมต่อแบบเดียวกันในหน้าที่เผยแพร่

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'th',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// เมื่อปิดหน้าจอ
stop?.()
viewer.unmount()
```

เมื่อพบภาษาใดเป็นครั้งแรก การดาวน์โหลดไวยากรณ์จะเริ่มขึ้น ระหว่างนั้นบล็อกจะแสดงด้วยตัวแยกโทเคนในตัวหรือเป็นข้อความธรรมดา เมื่อไวยากรณ์มาถึง `onGrammarLoaded()` จะเรียก `viewer.refresh()` เพื่อระบายสีบล็อกอีกครั้ง จึงดาวน์โหลดเฉพาะภาษาที่จำเป็น และไวยากรณ์ที่มาช้าจะถูกใช้โดยไม่ต้องเปลี่ยนหน้าอีกครั้ง

ฝั่งเอดิเตอร์ใช้ฟังก์ชัน `highlight` เดียวกัน เดโมเว็บไซต์ NABI แทนที่เฉพาะ `attach` ของ `codeWing` เริ่มต้นด้วย `makeCodeAttach({ highlight, version })` โดย `version` จะเปลี่ยนทุกครั้งที่ไวยากรณ์หนึ่งมาถึง และทำหน้าที่เป็นสัญญาณให้วาดโค้ดที่วาดไว้แล้วใหม่ บริการอิสระสามารถทำการเชื่อมต่อหน้าที่เผยแพร่ก่อน แล้วเพิ่มแนวทางนี้เฉพาะเมื่อต้องใช้การลงสี Shiki ระหว่างแก้ไขด้วย

## รูปแบบ CSS

จัดรูปแบบบล็อกโค้ดด้วย `.nabi-content pre` และโค้ดด้วย `.nabi-content pre > code` อย่าเปลี่ยน `white-space` เพราะมีผลต่อการตัดบรรทัดและการแก้ไขโค้ด เปลี่ยนสีโทเคนได้ด้วยตัวเลือก `[data-nabi-token]`

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
