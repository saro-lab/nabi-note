---
title: Cách dùng cơ bản
description: Tạo trình soạn thảo NABI NOTE trên trình duyệt, sau đó lưu và khôi phục tài liệu.
---

# Cách dùng cơ bản

Hướng dẫn này trình bày một trình soạn thảo kết xuất phía máy khách (CSR) trên trình duyệt: chọn wing, gắn trình soạn thảo cùng giao diện, rồi lưu và khôi phục NABI TREE JSON.

## Cài đặt và thêm markup cơ bản

```bash
npm install nabi-note
```

Dùng cùng stylesheet cho cả trình soạn thảo và nội dung đã xuất bản. Đừng tự thêm `contenteditable`; `mountSurface()` quản lý thuộc tính này.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## Gắn trình soạn thảo

`allBasic()` chọn các wing chính thức hoạt động mà không cần kết nối riêng cho ứng dụng. Hãy thêm các wing gắn với dịch vụ như tải lên, lưu trữ tệp hoặc so sánh tài liệu theo hướng dẫn riêng của từng wing.

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'en',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'en',
  placeholder: 'Hãy viết gì đó.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'en',
})
```

`locale` điều khiển văn bản của thanh công cụ và trợ giúp; hãy truyền cùng một giá trị vào mọi lần gắn UI. `placeholder` chỉ hiện khi trình soạn thảo trống. `onError` nhận các lỗi độc lập từ lệnh và callback. `undoLimit` là số mục hoàn tác (mặc định là 200). `typingMergeMs` là khoảng thời gian gộp các lần gõ liên tiếp thành một bước hoàn tác; đặt thành `0` để giữ riêng từng lần chèn.

Mỗi trình soạn thảo cần vùng gốc nội dung và thanh công cụ riêng, không chồng lấn. Trên trang có nhiều trình soạn thảo, hãy cấp cho từng thanh công cụ bề mặt soạn thảo riêng qua `surface` để tiêu điểm và phím tắt không lẫn sang nhau.

## Chọn wing

Dùng `use()` và `drop()` để chỉ giữ các tính năng cần thiết. Trang của mỗi wing mô tả các tùy chọn mà nó nhận.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

Để gói nhỏ hơn, hãy truyền một mảng chỉ gồm các wing cần thiết, như `boldWing` và `imageWing`. Tên không xác định, tùy chọn không hợp lệ và phần phụ thuộc bị thiếu sẽ lỗi ngay khi tạo trình soạn thảo.

## Lưu và tải

Lưu kết quả `getJson()` dưới dạng NABI TREE JSON nếu tài liệu còn được chỉnh sửa. `getHtml()` dùng cho đầu ra đã xuất bản. Không bao giờ lưu kết quả chỉ dành cho trình soạn thảo của `getEditorHtml()`.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('Không thể đọc tài liệu đã lưu.')

const publishedHtml = nabi.getHtml()
```

Dùng `setHtml()` để nhập HTML bên ngoài. Trình soạn thảo trên trình duyệt đã có sẵn bộ phân tích HTML nên không cần tùy chọn parser. `setJson()` và `setHtml()` trả về `false` với đầu vào không rỗng không hợp lệ và giữ nguyên tài liệu hiện tại.

```ts
nabi.setHtml('<p>Tài liệu đã nhập</p>')
```

JSON và HTML đều là đầu vào không đáng tin cậy. NABI NOTE đọc chúng thông qua các wing đã đăng ký và quy tắc được phép của chúng, nhưng điều đó không thay thế việc cấp quyền tải lên hay chính sách bảo mật của dịch vụ.

## API thường dùng

| Tác vụ | API |
| --- | --- |
| Tạo trình soạn thảo | `createNabiWith`, `wings` |
| Gắn bề mặt và thanh công cụ | `mountSurface`, `mountToolbar` |
| Lưu và khôi phục | `getJson`, `setJson`, `getHtml`, `setHtml` |
| Theo dõi thay đổi | `nabi.onChange(listener)` |
| Hoàn tác và làm lại | `nabi.undo()`, `nabi.redo()` |
| Kết xuất HTML trên máy chủ | `renderStoredHtml` từ `nabi-note/ssr` |
| Thêm hành vi cho trang xuất bản | `attachViewer` từ `nabi-note/viewer` |
| So sánh tài liệu | `diffDocs` từ `nabi-note/diff` |

Để biết chính xác kiểu và mọi đối số, trước hết hãy kiểm tra khai báo của gói đã cài. Công cụ tự động hóa cũng có thể dùng [tài liệu tham khảo API bằng tiếng Anh](https://nabi.saro.me/llms/api-reference.md).

## Hủy gắn

Hủy gắn theo thứ tự ngược với lúc tạo. Không sửa trực tiếp `innerHTML` của vùng gốc đang soạn thảo; hãy thay đổi tài liệu qua API công khai như `setJson()`, `setHtml()` hoặc `applyCommand()`.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
