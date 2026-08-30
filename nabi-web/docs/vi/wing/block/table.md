---
title: Bảng
description: Tạo hàng, cột và hỗ trợ sửa ô, sắp xếp cột.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Bảng

Chọn số hàng và cột trên thanh công cụ để tạo bảng. Trong ô, viết tiếp nội dung bằng ngắt dòng thay vì nhiều đoạn; dùng Tab và Shift+Tab để di chuyển đến ô kế tiếp hoặc trước đó.

Thêm, xóa hàng và cột, gộp ô, chuyển ô tiêu đề đều hoạt động theo ô đang chọn. Sau khi lưu bảng có thể sắp xếp, để dùng sắp xếp cột trên trang xuất bản bạn phải kết nối `attachViewer()` của `nabi-note/viewer`. Bảng có ô đã gộp không phải đối tượng sắp xếp cột.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## Kiểu CSS

Tạo kiểu bảng bằng `.nabi-content table`, ô bằng `.nabi-content :is(th, td)`. Không thay đổi cấu trúc ô và nút sắp xếp do viewer thêm vào.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

Nếu đã kết nối viewer, hãy giữ nút `.nabi-sort`. Ép ghi đè `position` hoặc padding bên phải của ô có thể chồng lên nút sắp xếp.
