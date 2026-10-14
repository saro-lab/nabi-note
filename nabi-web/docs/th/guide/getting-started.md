---
title: การใช้งานพื้นฐาน
description: ขั้นตอนพื้นฐานสำหรับประกอบเครื่องมือแก้ไข NABI NOTE บนเบราว์เซอร์ แล้วบันทึกและกู้คืนเอกสาร
---

# การใช้งานพื้นฐาน

เอกสารนี้อธิบายเครื่องมือแก้ไขแบบ client-side rendered (CSR) ที่ทำงานในเบราว์เซอร์: เลือก wing เชื่อมต่อเครื่องมือแก้ไขและ UI จากนั้นบันทึกและกู้คืน NABI TREE JSON

## ติดตั้งและเพิ่มมาร์กอัปพื้นฐาน

```bash
npm install nabi-note
```

โหลดสไตล์ชีตเดียวกันให้ทั้งเครื่องมือแก้ไขและเนื้อหาที่เผยแพร่ อย่าเพิ่ม `contenteditable` เอง เพราะ `mountSurface()` เป็นผู้จัดการ

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## เชื่อมต่อเครื่องมือแก้ไข

`allBasic()` เลือก wing ทางการที่ทำงานได้โดยไม่ต้องเชื่อมต่อเฉพาะแอปพลิเคชัน เพิ่ม wing ที่เชื่อมกับบริการ เช่น การอัปโหลด ที่เก็บไฟล์ หรือการเปรียบเทียบเอกสาร ตามที่อธิบายไว้ในคู่มือแต่ละรายการ

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'en',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'en',
  placeholder: 'Write something.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'en',
})
```

`locale` ควบคุมข้อความบนแถบเครื่องมือและข้อความช่วยเหลือ จึงควรส่งค่าเดียวกันให้ UI ทุกจุดที่เชื่อมต่อ `placeholder` จะแสดงเฉพาะเมื่อเครื่องมือแก้ไขว่างเปล่า `onError` รับความล้มเหลวที่แยกออกมาจากคำสั่งและ callback `undoLimit` คือจำนวนรายการที่ย้อนกลับได้ (ค่าเริ่มต้น 200) `typingMergeMs` คือช่วงเวลาที่รวมการพิมพ์ต่อเนื่องเป็นการย้อนกลับหนึ่งครั้ง ตั้งเป็น `0` หากต้องการแยกทุกการแทรกออกจากกัน

ช่วงเวลาปริยายของการกด Enter ซ้ำเพื่อออกจากคอนเทนเนอร์บล็อกคือ 180ms ส่วน Esc และ Shift สองครั้งยังใช้ 350ms หากกำหนด `doubleEnterMs` ใน `mountSurface()` โดยตรง จะเปลี่ยนช่วงเวลาของทั้ง Enter และ Esc สองครั้ง

เครื่องมือแก้ไขแต่ละตัวต้องมี root สำหรับเนื้อหาและแถบเครื่องมือของตัวเองโดยไม่ซ้อนทับกัน ในหน้าที่มีเครื่องมือหลายตัว ให้ส่ง editor surface ของตนเองผ่าน `surface` ให้แถบเครื่องมือแต่ละอัน เพื่อไม่ให้โฟกัสและคีย์ลัดข้ามกัน

## กำหนดแถบเครื่องมือ

แถบเครื่องมือปริยายจัดกลุ่มหัวข้อ รูปแบบข้อความ การจัดแนว รายการ การแทรก และเครื่องมือเอกสารตามลำดับ พร้อมเส้นแบ่งแนวตั้งระหว่างกลุ่ม เดสก์ท็อปแสดงเครื่องมือทั้งหมดหลายแถว ส่วนมือถือแสดงเครื่องมือด่วนและปุ่มเครื่องมือทั้งหมดในแถวเดียว เครื่องมือคุณสมบัติของตาราง รูปภาพ และพื้นที่ลอยปรากฏด้านล่าง จึงใช้ร่วมกับเครื่องมือข้อความได้

ใช้ `groups` เปลี่ยนลำดับกลุ่ม และ `quick` เปลี่ยนลำดับเครื่องมือด่วนบนมือถือ เช่น ตัวแก้ไขที่แทรกรูปบ่อยอาจย้ายกลุ่ม `media` มาไว้ด้านหน้า

```ts
import { TOOLBAR_GROUPS, mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'th',
  groups: ['media', ...TOOLBAR_GROUPS.filter((group) => group !== 'media')],
  quick: ['b', 'i', 'tc', 'img'],
})
```

เครื่องมือด่วนใช้ลำดับที่ระบุโดยไม่มีเส้นแบ่ง ภายในกลุ่มใช้ลำดับการลงทะเบียนปีก หากเรนเดอร์แถบเครื่องมือล่วงหน้าด้วย SSR ให้ส่งลำดับกลุ่มเดียวกันทั้งเซิร์ฟเวอร์และเบราว์เซอร์ [ธีม CSS](./style#เกณฑ์ความกว้างของโหมดมือถือ) อธิบายการจัดวางตามความกว้างหน้าจอ

เชื่อมต่อ `mountHints()` เพื่อเลือกเครื่องมือด้วยคีย์บอร์ดโดยกด Shift สองครั้ง Tab เปลี่ยนกลุ่ม และปุ่มลูกศรเลื่อนไอคอนในกลุ่มเดียวกัน เดสก์ท็อปและเต็มหน้าจอใช้แถบเครื่องมือที่มองเห็น ส่วนมือถือใช้แผงเครื่องมือทั้งหมด

แผงรูปภาพ ช่อง URL และตัวเลือกไฟล์จำตำแหน่งช่วงเลือกเมื่อเปิด หากเพียงย้ายเคอร์เซอร์ จะยังแทรกที่ตำแหน่งเดิม แต่หากแก้ไขหรือแทนที่เอกสาร จะยกเลิกการป้อนและแจ้งให้ทราบ แม้เลิกทำจนเนื้อหาเหมือนเดิม ก็ไม่นำช่วงเลือกเก่ากลับมาใช้

## เลือก wing

ใช้ `use()` และ `drop()` เพื่อเก็บไว้เฉพาะฟีเจอร์ที่ต้องการ หน้า wing แต่ละหน้าจะอธิบายตัวเลือกที่รองรับ

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

หากต้องการ bundle ที่เล็กลง ให้ส่งเฉพาะ wing ที่จำเป็น เช่น `boldWing` และ `imageWing` เป็นอาร์เรย์ ชื่อที่ไม่รู้จัก ตัวเลือกที่ไม่ถูกต้อง และ dependency ที่ขาดหายจะล้มเหลวทันทีเมื่อสร้างเครื่องมือแก้ไข

## บันทึกและโหลด

บันทึกผลลัพธ์ `getJson()` เป็น NABI TREE JSON เมื่อเอกสารจะถูกแก้ไขอีกครั้ง `getHtml()` มีไว้สำหรับผลลัพธ์ที่เผยแพร่ ห้ามเก็บผลลัพธ์เฉพาะเครื่องมือแก้ไขจาก `getEditorHtml()`

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('The saved document could not be read.')

const publishedHtml = nabi.getHtml()
```

ใช้ `setHtml()` เพื่อนำเข้า HTML ภายนอก เครื่องมือแก้ไขบนเบราว์เซอร์มีตัวแยกวิเคราะห์ HTML อยู่แล้ว จึงไม่ต้องระบุตัวเลือก parser `setJson()` และ `setHtml()` จะคืนค่า `false` สำหรับอินพุตที่ไม่ว่างและไม่ถูกต้อง และปล่อยเอกสารปัจจุบันไว้โดยไม่เปลี่ยนแปลง

```ts
nabi.setHtml('<p>Imported document</p>')
```

ทั้ง JSON และ HTML เป็นอินพุตที่ไม่น่าเชื่อถือ NABI NOTE อ่านข้อมูลผ่าน wing ที่ลงทะเบียนและกฎที่อนุญาต แต่สิ่งนี้ไม่อาจทดแทนการอนุญาตการอัปโหลดหรือนโยบายความปลอดภัยของบริการคุณได้

## API ที่ใช้บ่อย

| งาน | API |
| --- | --- |
| สร้างเครื่องมือแก้ไข | `createNabiWith`, `wings` |
| เชื่อมต่อ surface และแถบเครื่องมือ | `mountSurface`, `mountToolbar` |
| บันทึกและกู้คืน | `getJson`, `setJson`, `getHtml`, `setHtml` |
| สังเกตการเปลี่ยนแปลง | `nabi.onChange(listener)` |
| ย้อนกลับและทำซ้ำ | `nabi.undo()`, `nabi.redo()` |
| เรนเดอร์ HTML บนเซิร์ฟเวอร์ | `renderStoredHtml` จาก `nabi-note/ssr` |
| เพิ่มพฤติกรรมให้หน้าเผยแพร่ | `attachViewer` จาก `nabi-note/viewer` |
| เปรียบเทียบเอกสาร | `diffDocs` จาก `nabi-note/diff` |

สำหรับ type และ argument ทุกตัวที่แน่นอน ให้ตรวจสอบ declaration ของแพ็กเกจที่ติดตั้งก่อน เครื่องมืออัตโนมัติสามารถใช้ [เอกสารอ้างอิง API ภาษาอังกฤษ](https://nabi.saro.me/llms/api-reference.md) ได้เช่นกัน

## ยกเลิกการเชื่อมต่อ

unmount ตามลำดับย้อนกลับจากการสร้าง อย่าแก้ไข `innerHTML` ของ editing root โดยตรง ให้เปลี่ยนเอกสารผ่าน public API เช่น `setJson()` `setHtml()` หรือ `applyCommand()`

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
