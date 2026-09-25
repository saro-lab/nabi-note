---
title: "Giao diện biểu tượng"
description: "Dùng biến CSS để thay biểu tượng wing, xem trước, toàn màn hình, bảng điều khiển, so sánh và sắp xếp bảng. Có thể trộn SVG, WebP và PNG; biểu tượng chưa chỉ định dùng tệp mặc định."
---

# Giao diện biểu tượng

Dùng biến CSS để thay biểu tượng wing, xem trước, toàn màn hình, bảng điều khiển, so sánh và sắp xếp bảng. Có thể trộn SVG, WebP và PNG; biểu tượng chưa chỉ định dùng tệp mặc định.

## Chọn tệp

Nạp CSS và thêm lớp giao diện vào trình soạn thảo hoặc phần tử cha chung. Hình ảnh giữ nguyên màu sắc, độ trong suốt và tỉ lệ.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

Dùng đường dẫn từ gốc như `/icons/...` hoặc URL HTTPS đầy đủ. Đường dẫn tương đối không được bảo đảm tính từ vị trí tệp giao diện. Khi tự lưu trữ CSS, sao chép cùng phiên bản `dist/icons/` cạnh `nabi.css`. Nếu ảnh không tải được, biểu tượng để trống nhưng tên nút, chú giải và thao tác vẫn hoạt động.

## Tìm biểu tượng khác

Thêm `--nabi-icon-` trước giá trị `data-nabi-icon` của phần tử để có biến CSS. Ví dụ, `diff-close` dùng `--nabi-icon-diff-close`. Xem <a href="/llms/icons.md" target="_blank" rel="noopener">quy ước biểu tượng</a> để biết quy tắc khóa ngữ cảnh, menu, lưu, lịch sử và các mục khác, gồm cách mã hóa ký tự đặc biệt.

## Chế độ tối và bảng điều khiển

Đổi lớp giao diện hoặc biến CSS sẽ cập nhật biểu tượng mà không cần mount lại. Biểu tượng mặc định theo giao diện sáng/tối. Tệp tùy chỉnh không kế thừa `currentColor`; hãy đặt bản tối như ví dụ nếu cần. Các bảng mở dưới `body` cũng theo giao diện biểu tượng và thay đổi lớp/kiểu của trình soạn thảo nguồn. Đặt biến trên trình soạn thảo hoặc cha chung, không chỉ bên trong thanh công cụ.

## Hiển thị nút mặc định

`showPreview` và `showFullscreen` đều mặc định là `true`. Đặt `false` sẽ bỏ nút tương ứng, đích lấy tiêu điểm và sự kiện của nó. Nếu cả hai là `false`, vùng công cụ trống cũng không được tạo.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

Truyền cùng tùy chọn hiển thị cho SSR và mount. Để đổi cấu hình, gọi `tools.unmount()` rồi mount với tùy chọn mới. Nếu không cần cả hai nút, vẫn có thể bỏ hoàn toàn mount công cụ và mã SSR. Các lệnh gọi trực tiếp `openPreview()` và `setFullscreen()` vẫn dùng được.
