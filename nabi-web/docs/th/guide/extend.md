---
title: wing แบบกำหนดเอง
description: ข้อตกลงและลำดับการพัฒนาสำหรับเพิ่มฟีเจอร์เอกสารที่บันทึกได้อย่างคงทน
---

# wing แบบกำหนดเอง

wing แบบกำหนดเองไม่ใช่แค่ปุ่มบนแถบเครื่องมือ แต่เป็นส่วนขยายแบบประกาศที่รวมโครงสร้างเอกสารที่บันทึก คำสั่ง การแปลง HTML และ Markdown กฎการนำเข้า และพฤติกรรมมุมมองไว้ด้วยกัน registry จะตรวจสอบก่อนมีเครื่องมือแก้ไข จึงป้องกันไม่ให้โครงสร้างที่ไม่ถูกต้องเข้าสู่เอกสาร

## เริ่มจาก factory ที่เล็กที่สุด

การจัดรูปแบบส่วนใหญ่ไม่ต้องประกาศเต็มรูปแบบ ใช้ `simpleMark()` สำหรับ inline mark ที่ไม่มีค่า `valueMark()` สำหรับ mark ที่มีชุดค่าจำกัด `boxObject()` สำหรับ block ที่ไม่มีลูก และ `listFamily()` สำหรับรายการ

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## สร้าง wing หลายชนิด

ตัวอย่างด้านล่างแต่ละอันมีรูปทรงข้อมูลที่บันทึกต่างกัน ให้ลงทะเบียนทีละอันก่อนและตรวจดู `getJson()` กับ `getHtml()` เพิ่มคำสั่งและปุ่มหลังจากโครงสร้างทำงานแล้วเท่านั้น

### 1. inline mark ไม่มีค่า: ตัวเน้น

ใช้ `simpleMark()` เมื่อฟีเจอร์เพียงห่อหุ้มข้อความ ข้อมูลนี้จะเก็บ `exStrong` และเรนเดอร์เป็น `<strong>`

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

เมื่อ `clearable: true` คำสั่งล้างการจัดรูปแบบจะลบ mark นี้ด้วย ก่อนเพิ่มปุ่ม ให้ใช้ผ่าน `nabi.applyCommand()` หรือคำสั่งแบบกำหนดเองอื่น selector `.nabi-content strong` เดียวกันจะจัดรูปแบบทั้งเครื่องมือแก้ไขและเนื้อหาที่เผยแพร่

### 2. inline mark ที่มีค่า: โทนสถานะ

ใช้ `valueMark()` สำหรับสี ขนาด หรือสถานะที่เลือกจากชุดที่อนุญาต ค่าจะเก็บไว้ใน `a.v` และค่าที่อยู่นอก list จะถูกลบระหว่าง `repair()`

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

รูปแบบที่บันทึกคือ `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }` CSS กำหนดเป้าหมายที่ค่าที่บันทึก จึงเปลี่ยนเนื้อหาที่เผยแพร่ด้วย อย่าลบค่าจาก list ที่มีอยู่โดยไม่รอบคอบ เพราะเอกสารที่บันทึกไว้ก่อนหน้าอาจสูญเสียค่าเหล่านั้นเมื่ออ่าน

### 3. block ที่ไม่มีลูก: เส้นคั่น

ใช้ `boxObject()` สำหรับ object เดี่ยวที่ไม่มีลูก เช่น รูปภาพ วิดีโอ หรือเส้นคั่น

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

สำหรับ object ที่มีค่า เช่น URL หรือความกว้าง ให้ประกาศการตรวจสอบใน `attrs` และใส่ค่าที่ต้องการใน `requires` ปฏิเสธค่าที่ตรวจสอบไม่ได้ด้วย `null` แทนการแทนค่ามาตรฐานอย่างเงียบ ๆ

### 4. block ที่มีหลายย่อหน้า: callout

สำหรับ block ที่เก็บเนื้อหาเอกสาร ให้ประกาศ `container` ค่า `holds: 'blocks'` อนุญาตให้มีลูกเป็นย่อหน้า รายการ และ object-block

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

การประกาศนี้เพียงอย่างเดียวไม่ได้สร้างวิธีห่อหุ้มย่อหน้าที่เลือก เพิ่ม pure command ใน `commands` และ `button` ที่เรียกมันก่อนแสดงฟีเจอร์ใน UI ของเครื่องมือแก้ไข

### 5. คู่ list และ item ที่จับคู่กัน

ใช้ `listFamily()` เมื่อ list และ item ต้องปรากฏร่วมกันเสมอ

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` ซ่อม block ภายใน list โดยห่อไว้ใน item เพิ่ม `itemDecl` และ `repairItem` สำหรับค่าระดับ item เช่น สถานะถูกเลือก

### ลงทะเบียนในชุดที่เรียงลำดับเดียวกัน

ใช้ declaration เดียวกันและลำดับเดียวกันบนเซิร์ฟเวอร์และในเบราว์เซอร์

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

## กำหนดชื่อและโครงสร้างเอกสาร

ชื่อที่เข้าไปในเอกสารต้องตรงกับ `ex[A-Z0-9]...` ชื่ออย่าง `exCallout` ป้องกันไม่ให้ wing ทางการในอนาคตเปลี่ยนความหมายของเนื้อหาที่บันทึกไว้

`place` กำหนดรูปทรงที่บันทึก: `mark` ห่อเนื้อหา inline, `void` เป็น block ที่ไม่มีลูก, `container` เก็บลูก, `attr` เปลี่ยน attribute ของย่อหน้า และ `tool` ไม่สร้าง node เอกสาร `container` ต้องมี `holds: 'blocks' | 'inline'` และ `toHtml()`

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf` และ `parts` ใช้ประกาศข้อจำกัดโครงสร้าง การประกาศ `parts` ต้องมี `partHtml` สำหรับแต่ละ part ด้วย ใช้ `attrKey` และ `attrValues` เพื่อจำกัด wing ที่เลือกค่า

## ตัวเลือก declaration ทั้งหมด

ประกาศเฉพาะสิ่งที่ wing ต้องการ factory มี field บางส่วนให้แล้ว

| ส่วน | ตัวเลือก | จุดประสงค์ |
| --- | --- | --- |
| พื้นฐาน | `w`, `place`, `basic`, `styles` | ชื่อ ชนิดโครงสร้าง การเป็นสมาชิก basic catalog และ CSS เริ่มต้น |
| โครงสร้าง | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | ชนิดลูก พฤติกรรม Enter attribute ที่อนุญาต และ boolean attribute |
| โครงสร้าง | `parts`, `allows`, `noAlign`, `requiresAnyOf` | part ภายใน ลูกที่อนุญาต การยกเว้นการจัดแนว และ dependency ของ wing |
| ค่า | `attrKey`, `attrValues`, `currentValue` | key และ list ของค่าที่บันทึก การตรวจหาค่าปัจจุบัน |
| คำสั่งและการป้อน | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | คำสั่ง การจัดการคีย์ พฤติกรรม Escape/double-key และกฎจัดรูปแบบอัตโนมัติ |
| พฤติกรรม surface | `attach` | พฤติกรรม DOM และการล้างข้อมูลของ surface |
| การแปลง | `toHtml`, `partHtml`, `toMd`, `partMd` | ผลลัพธ์ HTML และ Markdown |
| การนำเข้าและซ่อม | `claim`, `ioFilter`, `repair`, `partRepair` | การนำเข้า HTML การจัดการไฟล์ การตรวจสอบและซ่อม JSON |
| UI | `button`, `buttons`, `context` | declaration ของ UI แถบเครื่องมือและ context |
| ล้างการจัดรูปแบบ | `clearable` | คำสั่งล้างการจัดรูปแบบลบมันหรือไม่ |

ต้องมี `w` และ `place` เสมอ wing `mark`, `void` และ `container` ที่สร้าง node ต้องมี `toHtml()` ด้วย container ต้องมี `holds` และทุก part ที่ประกาศต้องมี `partHtml` ที่ตรงกัน

## รักษา HTML, Markdown และ JSON ไว้ด้วยกัน

`toHtml()` เรนเดอร์ node ที่บันทึกเป็น HTML ส่วน `toMd()` ส่งออก Markdown หากไม่มี Markdown builder ระบบจะเก็บ HTML ที่สร้างไว้เพื่อไม่ให้ข้อมูลสูญหาย ใช้ `claim()` เพื่อจดจำเฉพาะ element HTML ของคุณเองและ attribute ที่ผ่านการตรวจสอบเมื่อนำเข้า

`repair()` ทำงานเมื่อโหลด JSON และอีกครั้งหลังคำสั่ง คืน node ที่แก้ไขแล้วสำหรับ attribute ที่ไม่ถูกต้อง หรือ `null` สำหรับ node ที่เก็บไว้ไม่ได้ สร้าง HTML ด้วย `ctx.element()`, `ctx.escape()` และ `ctx.url()` อย่าต่อ tag attribute หรือ URL เองโดยข้ามการตรวจเหล่านั้น

## แยกคำสั่งออกจากพฤติกรรมมุมมอง

คำสั่งคือ pure function ของเอกสารและ selection ที่คืนเอกสารถัดไปพร้อม selection ภายในมัน คำสั่งไม่อ่านหรือเปลี่ยน DOM และคืน `null` เมื่อไม่สามารถเปลี่ยนอย่างถูกต้องได้ ตั้งชื่อคำสั่งเป็น lower camel case ที่เริ่มด้วยคำกริยา เช่น `insertNote`

ใส่พฤติกรรมที่ใช้เฉพาะ DOM เช่น การลากเลือกตาราง ไว้ใน `attach(host)` ลงทะเบียนการล้างข้อมูลให้ listener หรือ attribute ที่เปลี่ยนทุกตัวด้วย `host.onDispose()` ทันที เพื่อให้การตั้งค่าที่ล้มเหลวถูกล้างด้วย อย่าแก้ไข DOM ของข้อความที่กำลัง compose หรือ selection mapping ของ surface

ประกาศ control ของแถบเครื่องมือและ context ด้วย `button`, `buttons` และ `context` การทำกฎคำสั่งซ้ำใน UI แอปพลิเคชันอาจทำให้ UI กับ document model แยกจากกัน

## สไตล์ CSS

ใส่ CSS พื้นฐานที่ wing ต้องการใน `styles` สไตล์ wing ที่มีมาให้รวมอยู่ใน `nabi-note/nabi.css` แล้ว เบราว์เซอร์ที่ประกอบสไตล์ registry ที่เลือกสามารถใช้ `collectSheets()` และ `injectSheets()` ส่วน SSR ควรลิงก์ไฟล์ CSS แทน

ใช้ class และ data attribute เดียวกันสำหรับการแก้ไขและเนื้อหาที่เผยแพร่ แต่ห้ามเปลี่ยนโครงสร้าง `[data-key]` ที่แก้ไขอยู่ `display` หรือ `white-space` CSS ต้องเปลี่ยนเพียงรูปลักษณ์ ไม่ใช่ caret mapping

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

กำหนดเป้าหมายเฉพาะ class หรือ data attribute ที่ `toHtml()` สร้าง รักษาการเปลี่ยนแปลงเฉพาะบริการให้แคบลง เช่น `.article-body .ex-callout`

## ตรวจสอบข้อตกลงทั้งหมด

ตรวจสอบว่าเอกสาร JSON ที่บันทึกโหลดกลับมาเป็นโครงสร้างและ HTML เดิม ทดสอบว่า registry ปฏิเสธชื่อที่ไม่ถูกต้อง คำสั่งซ้ำ builder ที่ขาด และ dependency ที่ไม่ครบ ครอบคลุมการนำเข้า HTML ที่ไม่ถูกต้องและอินพุต `repair()` การจัดการ selection ของคำสั่ง ผลลัพธ์ SSR และมุมมองที่เผยแพร่พร้อมสไตล์

สำหรับ type และ argument ของ factory ที่ครบถ้วน ให้ตรวจสอบ declaration ที่ติดตั้งและ [เอกสารอ้างอิง API ภาษาอังกฤษ](https://nabi.saro.me/llms/api-reference.md)
