---
title: Thu gọn
description: Gộp phần tóm tắt và nội dung, đồng thời lưu trạng thái mở ban đầu.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Thu gọn

Gộp phần tóm tắt ngắn và nội dung thành một khối. Khi tạo từ thanh công cụ, hãy nhập phần tóm tắt trước rồi viết tiếp nội dung bên dưới.

Trạng thái mở được chọn bằng tam giác sẽ lưu trong tài liệu và trở thành trạng thái ban đầu trên trang xuất bản. Khi chỉnh sửa, phần nội dung vẫn được mở để có thể sửa, nhưng giá trị trạng thái đã lưu không thay đổi.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## Kiểu CSS

Bạn có thể tạo kiểu cho khối thu gọn bằng `.nabi-content details`, và tiêu đề bằng `.nabi-content details > summary`.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

Thuộc tính `open` là trạng thái mở ban đầu do tác giả lưu. CSS có thể tạo kiểu cho trạng thái này, nhưng tốt nhất không nên ép thay đổi trạng thái.
