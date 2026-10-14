---
title: ธีม CSS
description: ตั้งค่าสี แบบอักษร ขนาด และโหมดมืดของเครื่องมือแก้ไขและเนื้อหาที่เผยแพร่ด้วยตัวแปร CSS
---

# ธีม CSS

NABI NOTE ใช้ CSS ชุดเดียวกันสำหรับการแก้ไขและเนื้อหาที่เผยแพร่ โหลดสไตล์ชีตของแพ็กเกจครั้งเดียว แล้วเขียนทับเฉพาะตัวแปรที่ต้องการบน container ของบริการ

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

กำหนดคลาสธีมเดียวกันให้ `.nabi` ของตัวแก้ไขและ `.nabi-content` ของหน้าที่เผยแพร่ เพื่อใช้ตัวแปรเดียวกัน โหลด CSS ของบริการหลัง CSS ของแพ็กเกจ และระบุธีมปัจจุบันด้วย `data-nabi-theme`

```html
<div class="nabi brand-note" data-nabi-theme="light">...</div>
<article class="nabi-content brand-note" data-nabi-theme="light">...</article>
```

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## ตัวแปรที่ใช้บ่อย

| วัตถุประสงค์ | ตัวแปร |
| --- | --- |
| ข้อความและพื้นหลัง | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| เส้นขอบและสีเน้น | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| มุมและเงา | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| ตระกูลแบบอักษร | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| พื้นผิวการแก้ไข | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| แถบเครื่องมือติดขอบและตัวอย่าง | `--nabi-sticky-top`, `--nabi-preview-width` |
| control แบบสัมผัส | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| ความกว้างที่เปลี่ยนเป็นโหมดมือถือ | `--nabi-mobile-breakpoint` |

ไฮไลต์และสีข้อความใช้ `--nabi-hl-<name>` และ `--nabi-tc-<name>` ตามลำดับ พื้นหลังเซลล์ใช้ `--nabi-cell-<name>` รองรับ `yellow`, `green`, `cyan`, `pink`, `purple`, `orange` ตัวแปรเปลี่ยนเฉพาะสีที่แสดง ไม่เปลี่ยนชื่อสีที่บันทึก

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

ธีมปริยายใช้พื้นหลังเซลล์สีอ่อน โหมดมืดคงชื่อสีเดิม แต่ใช้ชุดสีแยกที่สว่างขึ้นและอิ่มสีน้อยลง เพื่อแยกสีบนพื้นมืดได้ง่าย สีโปร่งแสงเหล่านี้ทำให้เห็นพื้นด้านหลัง หากปรับสีเอง ให้ตรวจสอบคอนทราสต์ข้อความบนพื้นหลังจริงของหน้า หากต้องการแทนค่าตัวแปรสีปริยาย ให้กำหนดคลาสธีมที่องค์ประกอบตัวแก้ไขหรือเนื้อหาที่เผยแพร่จริงตามตัวอย่าง ไม่ใช่องค์ประกอบแม่ภายนอกใดก็ได้

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## เกณฑ์ความกว้างของโหมดมือถือ

แถบเครื่องมือปริยาย `layout: 'compact'` เปลี่ยนเป็นแถวเดียวบนมือถือเมื่อหน้าจอแคบกว่า `36rem` ถ้าเท่ากับ `36rem` ยังคงรูปแบบเดสก์ท็อป บนเดสก์ท็อป เครื่องมือทั้งหมดขึ้นบรรทัดใหม่แม้ตัวแก้ไขจะแคบ คุณสมบัติวัตถุก็ขึ้นบรรทัดใหม่ด้านล่าง โดยทั้งสองแถวกินพื้นที่เหนือข้อความ ในโหมดเต็มหน้าจอจะแสดงเครื่องมือทั้งหมดไม่ว่าหน้าจอกว้างเท่าใด

บนมือถือ เครื่องมือด่วน ปุ่มเครื่องมือทั้งหมด และปุ่มดูตัวอย่าง/เต็มหน้าจอที่เชื่อมต่อไว้ยังอยู่ในแถบหลัก และยังใช้ได้เมื่อเครื่องมือคุณสมบัติปรากฏ แผงเครื่องมือทั้งหมดใช้ลำดับกลุ่มและเส้นแบ่งเดียวกับเดสก์ท็อป `layout: 'wrap'` แสดงเครื่องมือทั้งหมดโดยขึ้นบรรทัดใหม่เสมอ

แผงมือถือเปิดในพื้นที่ว่างรอบแถบเครื่องมือและคุณสมบัติ ตัวเลือกขนาดตารางเป็นข้อยกเว้น โดยเปิดกลางพื้นหลังโปร่งแสง พร้อมตารางเลือก 5×5 ที่แตะง่าย ไม่ต้องรอคีย์บอร์ดปิด เมื่อเลือกขนาดจะแทรกหนึ่งตารางแล้วปิดตัวเลือก

กำหนด `--nabi-mobile-breakpoint` บน `:root` องค์ประกอบบรรพบุรุษ หรือ `.nabi` แต่ละตัวเพื่อเปลี่ยนเกณฑ์ ใช้ค่าความยาว CSS ที่ไม่ติดลบ เช่น `rem`, `px`, `calc()` เมื่อค่า CSS ขนาดฟอนต์ราก หรือความกว้างหน้าจอเปลี่ยน แผงที่เปิดอยู่จะปรับตามอัตโนมัติ แผงป้อนข้อมูลที่ย้ายไปใต้ `body` ยังใช้เกณฑ์ของตัวแก้ไขเดิม

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

พื้นที่ลอยมีเกณฑ์เปลี่ยนเป็นคอลัมน์เดียวแยกต่างหาก โดยดูความกว้างคอนเทนเนอร์ข้อความ ไม่ใช่หน้าจอ หากต่ำกว่า `36rem` จะแสดงหนึ่งคอลัมน์ และใช้การจัดวางเดียวกันเมื่อพิมพ์

## โหมดมืด

โหมดสว่างเป็นค่าเริ่มต้น เพิ่ม `.dark` ให้ `html` หรือ `body` หรือกำหนด `data-nabi-theme="dark"` บนเครื่องมือแก้ไขหรือเนื้อหาที่เผยแพร่เฉพาะจุด

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

ใช้ `data-nabi-theme="light"` เพื่อไม่รับ `.dark` ของ ancestor แอปพลิเคชันของคุณเป็นผู้ควบคุมการสลับธีม แพ็กเกจจะไม่ติดตาม `prefers-color-scheme` โดยอัตโนมัติ

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## จัดรูปแบบเนื้อหาที่เผยแพร่ด้วย

HTML ที่เผยแพร่ก็ต้องมี `.nabi-content` และ CSS ชุดเดียวกัน ตาราง บล็อกโค้ด รูปภาพ checklist และ drop cap เรนเดอร์ได้โดยไม่ต้องใช้ JavaScript เพิ่ม `nabi-note/viewer` เฉพาะพฤติกรรม เช่น การเรียงตารางหรือการเน้นโค้ด

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
  --nabi-bg: transparent;
}
```

ตั้งค่า layout ที่แพ็กเกจไม่ได้จัดการ เช่น ความกว้างของเนื้อหาและความสูงบรรทัด บน class ของบริการคุณ

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## อย่าเปลี่ยนโครงสร้างการแก้ไข

อย่าเปลี่ยน `display` หรือ `white-space` ของ node `[data-key]` ที่กำลังแก้ไข อย่าเพิ่ม pseudo-element ภายในข้อความที่แก้ไขได้ และอย่าปิดพฤติกรรม pointer ของ object wrapper กฎเหล่านี้อาจทำให้เรขาคณิตของ caret และการจับคู่เอกสารเสียหาย

drop cap ที่เผยแพร่ใช้ `::first-letter` ขณะที่ editing surface ใช้ element `[data-nabi-dropcap-letter]` จริง อย่าเพิ่มกฎ `::first-letter` อื่นภายใน `.nabi-editing` หรือแทนที่ element นั้น
