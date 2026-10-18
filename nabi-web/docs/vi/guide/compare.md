---
title: So sánh
description: So sánh hai tài liệu cạnh nhau và áp dụng nội dung cũ đã chọn vào tài liệu hiện tại.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# So sánh

Đặt hai tài liệu đã lưu cạnh nhau để xem thay đổi. Có thể mở giao diện mà không cần trình soạn thảo; kết nối callback để áp dụng nội dung cũ đã chọn vào tài liệu hiện tại.

## Chọn và áp dụng nội dung cũ

Bên trái là tài liệu cũ, bên phải là tài liệu hiện tại. Nhấn **&gt;&gt;** cạnh thay đổi để áp dụng nội dung cũ của đoạn hoặc nhóm dòng đó. Không chọn theo từng ký tự. Bạn cũng có thể khôi phục nội dung đã xóa hoặc bỏ nội dung mới thêm.

Thử khôi phục riêng giờ họp hoặc đồ cần mang theo. Mở **Tài liệu hiện tại được callback cập nhật** để xem kết quả. **Bắt đầu lại** khôi phục ví dụ ban đầu.

<CompareDemo />

## Giao diện so sánh độc lập

Nhập từ `nabi-note/diff`. Truyền NABI TREE JSON đã lưu hoặc chuỗi HTML vào `before` và `after`. Tạo registry với cùng wing như trình soạn thảo gốc để đọc và hiển thị đầy đủ bảng, danh sách, ảnh và nội dung khác.

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'vi',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

Mặc định chỉ hiện thay đổi và ngữ cảnh xung quanh. Nút thu gọn mở toàn bộ tài liệu; nút trước/sau chuyển giữa các thay đổi. Nếu không có thay đổi, toàn bộ tài liệu xuất hiện. Bỏ `onMerge` để chỉ đọc.

## Kết nối gộp bằng nhấp chuột qua callback

Nhấn nút sẽ gửi kết quả đề xuất đến `onMerge`. Chỉ nối callback không tự lưu tài liệu. Dịch vụ phải chấp nhận đề xuất và gọi `update()` để cập nhật so sánh.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'vi',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` là NABI TREE JSON chỉ áp dụng thay đổi đã chọn. `before` và `after` là tài liệu lúc nhấn; `changeId` xác định thay đổi, `revision` xác định trạng thái so sánh. Truyền `revision` này làm đối số thứ ba của `update()`: nếu so sánh đã thay đổi, hàm trả về `false` và không áp dụng đề xuất.

Nhấp lặp bị chặn khi chờ callback bất đồng bộ. Cập nhật bằng tài liệu khác hoặc tháo giao diện sẽ hủy `signal`. Khi lưu lên máy chủ, kiểm tra cả tín hiệu và phiên bản tài liệu để tránh ghi đè tài liệu mới bằng kết quả cũ.

## Mở so sánh từ trình soạn thảo

Kết nối wing `diff` và `mountDiffWing()` để mở từ thanh công cụ. Mốc là tài liệu được tải gần nhất. Chỉnh sửa thường và hoàn tác không đổi mốc này.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'vi',
  merge: true,
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

Với `merge: true`, nội dung cũ đã chọn được áp dụng vào trình soạn thảo. Có thể hoàn tác và mốc vẫn giữ nguyên. Nếu trình soạn thảo gốc thay đổi khi giao diện đang mở, so sánh được tính lại. Bỏ `merge` để giữ chế độ chỉ đọc.

Gọi `toolbar.unmount()` và `comparison.unmount()` khi gỡ giao diện. Để thêm phiên bản lúc bắt đầu sửa và tự gộp thay đổi hai bên, dùng [Gộp](./merge).
