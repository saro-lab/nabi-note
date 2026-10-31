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

## Dán URL

Nếu toàn bộ nội dung được dán, sau khi bỏ khoảng trắng ở đầu và cuối, là một URL `http://` hoặc `https://` hợp lệ, nội dung đó sẽ được chèn ngay dưới dạng liên kết. URL trong câu, văn bản chứa nhiều URL và đường dẫn tương đối vẫn được xử lý theo cách dán hiện có. Trong khối mã và trình soạn thảo không có wing liên kết, nội dung được giữ dưới dạng văn bản. Dữ liệu clipboard nội bộ hợp lệ được sao chép từ trình soạn thảo được ưu tiên để giữ nguyên định dạng gốc.

Dùng callback `onPasteUrl` trong `mountSurface()` để chọn văn bản hiển thị của liên kết.

| Đối số | Giá trị |
| --- | --- |
| `url` | URL đầy đủ sau khi bỏ khoảng trắng ở đầu và cuối |
| `isSameOrigin` | Cho biết giao thức, máy chủ và cổng của URL có trùng với origin của tài liệu chứa trình soạn thảo hay không |
| `path` | Đường dẫn bắt đầu bằng `/`, bao gồm chuỗi truy vấn và phần fragment. Ví dụ: `/posts/1?a=2#top` |

```ts
const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#editor')!,
  onPasteUrl(url, isSameOrigin, path) {
    if (isSameOrigin && path === '/guide') return 'NABI NOTE'
    return url
  },
})
```

Nếu chuỗi trả về chứa ký tự không phải khoảng trắng, chuỗi đó sẽ được dùng làm văn bản hiển thị. Nếu không có callback, callback trả về giá trị rỗng hoặc không phải chuỗi, hay xảy ra lỗi, URL đã dán vẫn là văn bản hiển thị. Chuỗi trả về không bao giờ được diễn giải thành HTML và không thay đổi địa chỉ liên kết.

Callback cũng hỗ trợ hàm `async` và Promise. Liên kết URL được chèn ngay trong khi chờ phản hồi; kết quả hợp lệ đến sau chỉ thay đổi văn bản hiển thị của liên kết đó. Kết quả đến muộn bị bỏ qua nếu liên kết đã được sửa hoặc xóa, tài liệu mới đã được tải, hoặc surface đã được tháo.

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
