---
title: Hình ảnh
description: Nhập địa chỉ ảnh và điều chỉnh chiều rộng, căn chỉnh.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Hình ảnh

Nhập địa chỉ ảnh và điều chỉnh chiều rộng, căn chỉnh. Mặc định chỉ cho phép địa chỉ `http:`, `https:` hoặc đường dẫn cùng trang; ảnh mới bắt đầu với căn giữa và chiều rộng 60%.

Chiều rộng chỉ được lưu trong các mức đã định, còn căn chỉnh được lưu trên đoạn văn bọc ảnh. Để dùng xem trước `blob:` và `data:image/...`, bạn phải cho phép rõ ràng URL cục bộ ở cả image wing và phần lắp ráp trình soạn thảo. URL dữ liệu SVG không được cho phép.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

Wing này thêm địa chỉ vào tài liệu, không truyền tệp. Để gửi tệp lên máy chủ, hãy kết nối [upload wing](/vi/wing/etc/upload).

## Kiểu CSS

Tạo kiểu cho ảnh bằng `.nabi-content img`. Giữ nguyên chiều rộng và căn chỉnh đã lưu, chỉ thay đổi diện mạo như viền hoặc bóng.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

Giữ nguyên các quy tắc cơ bản về `max-inline-size`, `block-size`, chiều rộng và căn chỉnh. Kích thước ảnh là giá trị lưu trong tài liệu; ép cố định bằng CSS có thể xung đột với chiều rộng do tác giả chọn.
