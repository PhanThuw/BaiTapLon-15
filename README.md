# FixFlow – Phần Manager/Admin

Bộ mã nguồn khởi đầu cho 7 giao diện được giao:
- MAN-01 Dashboard Manager
- MAN-02 Dispatch Board
- MAN-03 SLA Monitor
- MAN-04 Failure Insights
- ADM-01 User Management
- ADM-02 Asset Management
- ADM-03 Issue Category

## Chạy thử
Mở `index.html` bằng trình duyệt (khuyến nghị dùng Live Server trong VS Code).

## Phạm vi hiện có
- Giao diện responsive dùng CSS thuần.
- Dữ liệu demo lưu bằng LocalStorage.
- Tìm kiếm/lọc và CRUD cơ bản cho User, Asset, Issue Category.
- Dashboard thống kê dữ liệu demo.
- Dispatch Board cho phép đổi người phụ trách/trạng thái.
- SLA Monitor hiển thị trạng thái đúng hạn/trễ hạn.
- Failure Insights có nút mô phỏng tóm tắt lỗi lặp lại bằng quy tắc JavaScript, không gọi AI API thật.

## Việc cần nhóm tự hoàn thiện trước khi nộp
- Thay dữ liệu demo bằng dữ liệu thống nhất của nhóm.
- Kiểm thử từng trạng thái rỗng/lỗi và xác thực biểu mẫu.
- Tạo nhánh Git, commit, PR và quay video OBS theo yêu cầu môn học.
- Nếu giảng viên yêu cầu Figma/Canva, cần tạo bản thiết kế và được duyệt.
