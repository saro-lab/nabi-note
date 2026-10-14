---
title: Chủ đề CSS
description: Cấu hình màu sắc, phông chữ, kích thước và chế độ tối cho trình soạn thảo lẫn nội dung xuất bản bằng biến CSS.
---

# Chủ đề CSS

NABI NOTE dùng cùng CSS cho nội dung soạn thảo và xuất bản. Tải stylesheet của gói một lần, rồi chỉ ghi đè các biến cần thiết trên vùng chứa của dịch vụ.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Gán cùng lớp giao diện cho `.nabi` của trình soạn thảo và `.nabi-content` của trang xuất bản để áp dụng cùng biến cho cả hai. Nạp CSS dịch vụ sau CSS gói và chỉ định giao diện hiện tại bằng `data-nabi-theme`.

```html
<div class="nabi brand-note" data-nabi-theme="light">...</div>
<article class="nabi-content brand-note" data-nabi-theme="light">...</article>
```

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## Biến thường dùng

| Mục đích | Biến |
| --- | --- |
| Văn bản và nền | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| Viền và màu nhấn | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| Góc và bóng | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| Họ phông chữ | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| Bề mặt soạn thảo | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| Thanh công cụ dính và bản xem trước | `--nabi-sticky-top`, `--nabi-preview-width` |
| Điều khiển cảm ứng | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| Chiều rộng chuyển sang chế độ di động | `--nabi-mobile-breakpoint` |

Tô sáng và màu chữ dùng `--nabi-hl-<name>` và `--nabi-tc-<name>`. Nền ô bảng dùng `--nabi-cell-<name>` với `yellow`, `green`, `cyan`, `pink`, `purple`, `orange`. Biến chỉ đổi màu hiển thị, không đổi tên màu đã lưu.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

Giao diện mặc định dùng nền ô màu nhạt. Chế độ tối giữ tên màu nhưng dùng bộ màu riêng sáng hơn và ít bão hòa hơn để dễ phân biệt trên nền tối. Các màu bán trong suốt để lộ nền phía dưới; khi tùy chỉnh, hãy kiểm tra độ tương phản chữ trên nền trang thực tế. Muốn ghi đè biến màu mặc định, hãy gán lớp giao diện vào chính phần tử soạn thảo hoặc nội dung xuất bản như trên, thay vì một phần tử cha bên ngoài bất kỳ.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## Ngưỡng chế độ di động

Thanh công cụ mặc định `layout: 'compact'` chuyển thành một hàng di động khi màn hình hẹp hơn `36rem`. Đúng `36rem` vẫn giữ bố cục máy tính. Trên máy tính, mọi công cụ xuống hàng ngay cả khi trình soạn thảo hẹp. Thuộc tính đối tượng cũng xuống hàng bên dưới; cả hai hàng chiếm chỗ phía trên nội dung. Toàn màn hình mở mọi công cụ bất kể độ rộng màn hình.

Trên di động, công cụ nhanh, nút tất cả công cụ và các nút xem trước/toàn màn hình đã kết nối vẫn ở thanh chính. Chúng vẫn dùng được khi công cụ thuộc tính xuất hiện. Bảng tất cả công cụ dùng cùng thứ tự nhóm và vạch ngăn như máy tính. `layout: 'wrap'` luôn hiển thị mọi công cụ có xuống hàng.

Bảng di động mở trong khoảng trống quanh thanh công cụ và thuộc tính. Bộ chọn kích thước bảng là ngoại lệ: mở ở giữa trên nền bán trong suốt, với lưới 5×5 dễ chạm. Không chờ bàn phím đóng; chọn kích thước sẽ chèn một bảng rồi đóng bộ chọn.

Đặt `--nabi-mobile-breakpoint` trên `:root`, phần tử tổ tiên hoặc từng `.nabi` để đổi ngưỡng. Dùng độ dài CSS không âm như `rem`, `px`, `calc()`. Khi giá trị CSS, cỡ chữ gốc hoặc độ rộng màn hình thay đổi, bảng đang mở cũng tự cập nhật. Bảng nhập chuyển xuống dưới `body` vẫn theo ngưỡng của trình soạn thảo gốc.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

Vùng nổi có ngưỡng một cột riêng. Nó dùng một cột khi container nội dung, không phải màn hình, hẹp hơn `36rem`; khi in cũng dùng bố cục này.

## Chế độ tối

Chế độ sáng là mặc định. Thêm `.dark` vào `html` hoặc `body`, hoặc đặt `data-nabi-theme="dark"` trên một trình soạn thảo hay phần thân nội dung xuất bản cụ thể.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Dùng `data-nabi-theme="light"` để không áp dụng `.dark` của phần tử tổ tiên. Ứng dụng của bạn điều khiển việc đổi chủ đề; gói không tự động theo `prefers-color-scheme`.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## Tạo kiểu cả nội dung xuất bản

HTML đã xuất bản cũng cần `.nabi-content` và cùng CSS. Bảng, khối mã, ảnh, danh sách kiểm tra và chữ cái đầu đoạn lớn được kết xuất không cần JavaScript. Chỉ thêm `nabi-note/viewer` cho các hành vi như sắp xếp bảng hoặc tô sáng mã.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
  --nabi-bg: transparent;
}
```

Đặt bố cục mà gói không quản lý, như chiều rộng phần thân và chiều cao dòng, trên lớp của dịch vụ.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## Không thay đổi cấu trúc soạn thảo

Không thay đổi `display` hoặc `white-space` trên nút `[data-key]` đang soạn thảo, không thêm phần tử giả trong văn bản có thể sửa, cũng không vô hiệu hóa hành vi con trỏ trên phần bao đối tượng. Các quy tắc này có thể làm hỏng hình học con trỏ và ánh xạ tài liệu.

Chữ cái đầu đoạn lớn khi xuất bản dùng `::first-letter`, còn bề mặt soạn thảo dùng phần tử thật `[data-nabi-dropcap-letter]`. Đừng thêm quy tắc `::first-letter` khác trong `.nabi-editing` hoặc thay thế phần tử đó.
