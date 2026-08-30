---
title: Lập trình vibe với AI
description: Giúp các tác tử lập trình sử dụng NABI NOTE chính xác bằng cách dựa vào API công khai hiện tại và phạm vi tài liệu.
---

# Lập trình vibe với AI

NABI NOTE cung cấp [`llms.txt`](/llms.txt) cho AI và công cụ tự động hóa. Thay vì yêu cầu tác tử đoán toàn bộ thư viện, hãy bắt đầu bằng chỉ mục này và cho nó chỉ đọc những tài liệu cần cho công việc.

## Prompt dùng ngay

Hãy điền framework và các tính năng bạn cần vào ví dụ dưới đây.

```text
Hãy xây dựng trình soạn thảo với NABI NOTE (nabi-note).
Trước hết, hãy đọc https://nabi.saro.me/llms.txt, sau đó chỉ đọc các tài liệu cần thiết cho công việc này.

Môi trường: Vue 3 + TypeScript
Tính năng cần có: định dạng cơ bản, bảng, hình ảnh và tải lên
Nguồn lưu trữ: NABI TREE JSON
Cách xuất bản: render JSON đã lưu thành HTML trên máy chủ

Chỉ sử dụng các export công khai và API thực sự có trong kiểu đã cài đặt.
Sau khi triển khai, hãy chạy kiểm tra kiểu và build, rồi cho biết các tệp đã thay đổi cùng kết quả xác minh.
```

Nếu tác tử không thể mở URL, hãy đưa `llms.txt` và nội dung các tài liệu liên kết phù hợp vào cuộc trò chuyện.

## Chỉ định đúng tài liệu cần thiết

`llms.txt` là một chỉ mục ngắn gọn. Thường sẽ hữu ích hơn nếu chỉ đưa tác tử các trang liên quan thay vì gửi toàn bộ tài liệu ngay từ đầu.

- Khi lắp ráp trình soạn thảo bằng npm, hãy đọc [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md).
- Với ví dụ CDN, dùng [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md).
- Để chọn và kết hợp wing, xem [`wings.md`](https://nabi.saro.me/llms/wings.md).
- Với JSON đã lưu, HTML và thông báo thay đổi, xem [`document-model.md`](https://nabi.saro.me/llms/document-model.md).
- Với việc nhập HTML, dán và ranh giới tải lên, xem [`io-security.md`](https://nabi.saro.me/llms/io-security.md).
- Với wing tùy chỉnh và render máy chủ, dùng [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), [`ssr.md`](https://nabi.saro.me/llms/ssr.md).
- Với viewer, diff, kiểu dáng và drop cap, xem [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), [`styling.md`](https://nabi.saro.me/llms/styling.md).
- Để tìm import và kiểu chính xác, xem [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md).

## Cung cấp yêu cầu sản phẩm

Tác tử không thể suy ra cách lưu trữ, chính sách bảo mật hay hành vi tải lên chỉ từ màn hình chỉnh sửa. Hãy cho biết framework thực tế, các wing cần dùng và không dùng, phạm vi lưu JSON và HTML, hợp đồng yêu cầu và phản hồi của điểm cuối tải lên, giới hạn tệp, cũng như việc trang xuất bản có cần SSR, viewer hay diff hay không.

Với những điều chưa quyết định, hãy yêu cầu tác tử giải thích lựa chọn và tác động trước khi tự chọn để triển khai.

## Tiêu chí kiểm tra kết quả

Hãy kiểm tra mã được tạo như mọi mã khác. Đặc biệt, hãy xác nhận rằng mã:

- tải `nabi-note/nabi.css` cho cả màn hình chỉnh sửa lẫn nội dung xuất bản;
- dùng cùng một `registry` cho các wing đã chọn và mọi mount;
- lưu `getJson()`, không bao giờ lưu `getEditorHtml()`;
- không ghi trực tiếp vào `innerHTML` của phần tử `.nabi-content` đang chỉnh sửa;
- unmount mọi mount khi đóng màn hình;
- kiểm tra MIME, kích thước, quyền hạn và nơi lưu trữ trên máy chủ tải lên;
- dùng cùng thứ tự wing và các tùy chọn ảnh hưởng đến HTML trên máy chủ lẫn trình duyệt;
- xác nhận tên export thực tế bằng kiểm tra kiểu, kiểm thử và build.

Hành vi IME, con trỏ và luồng lưu-tải cần được kiểm tra thực tế, ngay cả khi trang có vẻ chạy đúng một lần. Hãy thử nhập liệu tổ hợp trên thiết bị di động và khôi phục tài liệu đã lưu.

## Ưu tiên phiên bản đã cài

Khi dự án đã cài `nabi-note`, exports trong `package.json` và khai báo kiểu của gói đó là căn cứ trực tiếp hơn website được xây cho một bản phát hành khác. Hãy yêu cầu tác tử kiểm tra sự khác biệt phiên bản này trước khi viết mã.
