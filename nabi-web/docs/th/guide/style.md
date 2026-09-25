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
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

วาง token ที่ใช้ร่วมกันบน parent เดียวกัน เพื่อให้เครื่องมือแก้ไขและมุมมองที่เผยแพร่คงภาษาภาพเดียวกัน

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
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

token ของการเน้นและสีข้อความใช้ `--nabi-hl-<name>` และ `--nabi-tc-<name>` ตัวอย่างเช่น การเปลี่ยน `--nabi-hl-yellow` จะเปลี่ยนสีที่แสดงของ highlight `yellow` ที่บันทึกไว้โดยไม่เปลี่ยนข้อมูลเอกสาร

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## เกณฑ์ความกว้างของโหมดมือถือ

โหมดมือถือจะเริ่มเมื่อความกว้างของแถบเครื่องมือ แถวบริบท หรือพื้นที่แสดงผลน้อยกว่า `36rem` หากเท่ากับ `36rem` พอดีจะยังใช้เค้าโครงปกติ ในโหมดมือถือ แถบเครื่องมือและแถวบริบทจะเลื่อนในแนวนอน แผงจะอยู่กึ่งกลาง และตารางเลือกขนาดตารางจะลดเหลือ 5×5 ช่องที่เหมาะกับการสัมผัส

กำหนด `--nabi-mobile-breakpoint` บน `:root` องค์ประกอบบรรพบุรุษ หรือ `.nabi` แต่ละตัวเพื่อเปลี่ยนเกณฑ์ ใช้ค่าความยาว CSS ที่ไม่ติดลบ เช่น `rem`, `px` หรือ `calc()` เมื่อค่า CSS ขนาดตัวอักษรของราก ความกว้างของคอนเทนเนอร์ หรือพื้นที่แสดงผลเปลี่ยน แผงที่เปิดอยู่ก็จะอัปเดตอัตโนมัติ แผงป้อนข้อมูลที่ย้ายไปอยู่ใต้ `body` ยังคงใช้เกณฑ์ของตัวแก้ไขเดิม

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

อุปกรณ์สัมผัสยังคงใช้ปุ่มควบคุมขนาดใหญ่แม้ความกว้างจะเกินเกณฑ์นี้

## โหมดมืด

โหมดสว่างเป็นค่าเริ่มต้น เพิ่ม `.dark` ให้ `html` หรือ `body` หรือกำหนด `data-nabi-theme="dark"` บนเครื่องมือแก้ไขหรือเนื้อหาที่เผยแพร่เฉพาะจุด

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

ใช้ `data-nabi-theme="light"` เพื่อไม่รับ `.dark` ของ ancestor แอปพลิเคชันของคุณเป็นผู้ควบคุมการสลับธีม แพ็กเกจจะไม่ติดตาม `prefers-color-scheme` โดยอัตโนมัติ

```css
.dark .brand-note {
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
  --nabi-font: "Source Serif 4", Georgia, serif;
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
