---
title: Trích dẫn
description: Gộp trích dẫn hoặc ngữ cảnh riêng thành nhiều đoạn.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Trích dẫn

Gộp trích dẫn hoặc ngữ cảnh riêng thành nhiều đoạn. Trong đoạn trống, nhập Space sau `>` hoặc chuyển các đoạn đã chọn thành trích dẫn trên thanh công cụ.

Bên trong trích dẫn có thể chứa không chỉ đoạn văn thường mà cả các khối như danh sách và hình ảnh. Chuyển đổi lại cùng phạm vi để đưa chúng ra thành các đoạn bên ngoài.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## Kiểu CSS

Bạn có thể đổi viền và khoảng cách của trích dẫn bằng `.nabi-content blockquote`.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

Giữ nguyên cấu trúc đoạn văn trong `blockquote`; chỉ thay đổi phần trình bày như lề ngoài, viền và màu.
