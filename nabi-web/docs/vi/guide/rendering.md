---
title: Thiết lập SSR
description: Tạo HTML an toàn từ NABI TREE đã lưu trên máy chủ và hydrate trình soạn thảo trong trình duyệt.
---

# Thiết lập SSR

Trên máy chủ, chỉ import `nabi-note/ssr`, không import surface hay UI dành cho trình duyệt. Nó kiểm tra NABI TREE JSON đã lưu rồi chuyển thành HTML xuất bản hoặc HTML trình soạn thảo có thể hydrate.

## Tạo HTML xuất bản

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('Không thể đọc tài liệu đã lưu.')
```

`renderStoredHtml()` kiểm tra và chuẩn hóa JSON nhận được, rồi trả về HTML xuất bản. `null` nghĩa là registry hiện tại không thể đọc đầu vào đó. Hãy dùng CSS của gói và `.nabi-content` trên trang xuất bản.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

Chỉ thêm `attachViewer()` từ `nabi-note/viewer` trên trình duyệt khi cần sắp xếp bảng tương tác hoặc tô màu mã. Nội dung xuất bản thông thường chỉ cần CSS.

## Hydrate HTML trình soạn thảo đã render trước

Để hiển thị trình soạn thảo ngay từ lần vẽ đầu tiên, hãy render bằng `renderStoredEditorHtml()` trên máy chủ và truyền `hydrate: true` cho surface trong trình duyệt.

```ts
// máy chủ
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// trình duyệt
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

Máy chủ và trình duyệt phải dùng cùng tài liệu, cùng các khai báo wing theo cùng thứ tự, và các tùy chọn ảnh hưởng đến HTML giống nhau. Đưa nguyên vẹn đầu ra máy chủ vào làm các con trực tiếp của content root, đồng thời không đặt sẵn `contenteditable` cho root đó. Nếu cấu trúc khác nhau, surface sẽ render HTML trình soạn thảo mới.

## Render trước cả thanh công cụ

`renderToolbarHtml()` và `renderViewToolsHtml()` có thể render trước các điều khiển thanh công cụ trên máy chủ. Mount trong trình duyệt sẽ gắn hành vi cho chúng khi registry, locale và thứ tự nhóm khớp nhau. Không hỗ trợ DOM host tùy ý bên trong toolbar root.

Không dùng API cần trình duyệt như `injectSheets()` trong SSR. Hãy liên kết tệp `nabi-note/nabi.css` đã build hoặc đưa nó vào bundle CSS của bạn.
