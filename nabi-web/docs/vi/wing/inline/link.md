---
title: Liên kết
description: Kết nối địa chỉ web an toàn và hiển thị tệp đính kèm đã tải lên.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Liên kết

Chọn chữ để gắn địa chỉ. Nhập địa chỉ khi không chọn gì thì chính địa chỉ đó trở thành chữ liên kết; nhập địa chỉ `http://` hoặc `https://` rồi nhấn Space hoặc Enter cũng chuyển thành liên kết.

Liên kết chỉ lưu địa chỉ `http:`, `https:` và đường dẫn cùng trang bắt đầu bằng `.` hoặc `/`. Các địa chỉ không xác định được nguồn rõ ràng như `javascript:` hoặc `//example.com` bị từ chối. Liên kết tệp đính kèm do tải lên tạo ra còn lưu thông tin tệp và không thể tạo trực tiếp như liên kết thường.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## Kiểu CSS

Bạn có thể tạo kiểu riêng cho liên kết thường bằng `.nabi-content a`, và liên kết tệp đính kèm bằng `.nabi-content a[data-nabi-file]`.

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

`::before` và `::after` của liên kết tệp đính kèm được dùng để hiển thị biểu tượng tệp và phần mở rộng, vì vậy tốt nhất không thay đổi hoặc xóa `content`.
