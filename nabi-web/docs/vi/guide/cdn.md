---
title: Sử dụng CDN
description: Ví dụ kết nối NABI NOTE cho trình duyệt mà không cần công cụ build.
---

<script setup>
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
</script>

# Sử dụng CDN

Trên trang tĩnh khó cài đặt gói, bạn có thể tải bundle trình duyệt và CSS của NABI NOTE từ CDN. Ví dụ dưới đây tự đọc phiên bản gói khi build để tạo địa chỉ, rồi lắp ráp trình soạn thảo bằng đối tượng toàn cục `NabiNote`.

<CdnDemo />

## Điều cần kiểm tra trong NABI NOTE

- Trong mã triển khai, dùng cùng một phiên bản cố định cho CSS và JavaScript trình duyệt. Địa chỉ không có phiên bản như `latest` có thể thay đổi hành vi khi có bản phát hành mới.
- Bundle trình duyệt cung cấp API gốc dưới dạng `window.NabiNote`. Không có bundle toàn cục riêng cho `nabi-note/ssr`, `nabi-note/viewer` và `nabi-note/diff`.
- Việc lưu tệp và lịch sử cục bộ trong ví dụ chạy trong trình duyệt của người dùng. Nếu cần lưu trên máy chủ hoặc đồng bộ tài khoản, hãy gửi kết quả `getJson()` đến API của ứng dụng.
- Khi thêm tải lên, hãy kết nối không chỉ wing `upload` mà cả hàm gửi thực tế và các wings hình ảnh hoặc liên kết cần thiết. Máy chủ tải lên chịu trách nhiệm kiểm tra tệp.
- Bundle trình duyệt đã tích hợp HTML parser. Vì vậy `setHtml()`, mở tệp HTML và dán HTML không cần tùy chọn parser riêng hay API riêng tư.

CDN chỉ khác ở cách tải. Định dạng lưu và kiểm tra đầu vào giống khi cài qua npm, vì vậy hãy xem cả [cách dùng cơ bản](/vi/guide/getting-started).
