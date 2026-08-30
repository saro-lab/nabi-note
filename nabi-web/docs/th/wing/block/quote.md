---
title: คำอ้างอิง
description: รวมคำอ้างอิงหรือบริบทแยกต่างหากไว้หลายย่อหน้า
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# คำอ้างอิง

รวมคำอ้างอิงหรือบริบทแยกต่างหากไว้หลายย่อหน้า พิมพ์ `>` แล้วกด Space ในย่อหน้าว่าง หรือเปลี่ยนย่อหน้าที่เลือกเป็นคำอ้างอิงจากแถบเครื่องมือ

ภายในคำอ้างอิงใส่ได้ทั้งย่อหน้าปกติและบล็อกอย่างรายการหรือรูปภาพ เปลี่ยนช่วงเดิมอีกครั้งเพื่อคลายกลับเป็นย่อหน้าภายนอก

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## รูปแบบ CSS

เปลี่ยนเส้นขอบและระยะห่างของคำอ้างอิงด้วย `.nabi-content blockquote`

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

คงโครงสร้างย่อหน้าภายใน `blockquote` ไว้ และเปลี่ยนเฉพาะการแสดงผล เช่น ระยะขอบด้านนอก เส้นขอบ และสี
