---
title: YouTube
description: Nhúng video YouTube vào tài liệu và điều chỉnh chiều rộng.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

Nhận địa chỉ video YouTube hoặc ID video để tạo khối nhúng. Tài liệu chỉ lưu ID video 11 ký tự và chiều rộng, không lưu toàn bộ địa chỉ; video mới bắt đầu với căn giữa và chiều rộng 70%.

Chọn chiều rộng trong các mức đã định, còn căn chỉnh được lưu trên đoạn văn bọc video. Trong trình soạn thảo, lần nhấp đầu tiên chọn video, và nhấp lại sau khi chọn để phát. Thay vì đổi địa chỉ, hãy xóa video rồi thêm lại.

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## Kiểu CSS

Bạn có thể đổi viền và góc của video bằng `.nabi-content iframe`. Không thay đổi chiều rộng và căn chỉnh đã lưu.

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

`aspect-ratio`, chiều rộng và lề căn chỉnh được gói dùng để giữ kích thước video, vì vậy không ghi đè chúng.
