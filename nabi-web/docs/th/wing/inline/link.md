---
title: ลิงก์
description: เชื่อมต่อที่อยู่เว็บที่ปลอดภัยและแสดงไฟล์แนบที่อัปโหลดแล้ว
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ลิงก์

เลือกข้อความแล้วเชื่อมต่อที่อยู่ หากป้อนที่อยู่โดยไม่เลือกข้อความ ที่อยู่นั้นจะถูกใส่เป็นข้อความลิงก์เอง การป้อนที่อยู่ `http://` หรือ `https://` แล้วกด Space หรือ Enter ก็เปลี่ยนเป็นลิงก์ได้เช่นกัน

ลิงก์เก็บได้เฉพาะ `http:`, `https:` และพาธไซต์เดียวกันที่เริ่มด้วย `.` หรือ `/` ที่อยู่ซึ่งระบุแหล่งที่มาไม่ได้ชัดเจน เช่น `javascript:` หรือ `//example.com` จะถูกปฏิเสธ ลิงก์ไฟล์แนบที่สร้างจากการอัปโหลดยังเก็บข้อมูลไฟล์ไว้ด้วย และไม่สามารถสร้างเองแบบลิงก์ทั่วไปได้

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## รูปแบบ CSS

จัดรูปแบบลิงก์ทั่วไปด้วย `.nabi-content a` และลิงก์ไฟล์แนบแยกต่างหากด้วย `.nabi-content a[data-nabi-file]`

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

ส่วน `::before` และ `::after` ของลิงก์ไฟล์แนบใช้แสดงไอคอนไฟล์และนามสกุล จึงไม่ควรเปลี่ยนหรือลบ `content`
