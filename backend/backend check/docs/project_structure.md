# Cấu Trúc Thư Mục Dự Án & Giải Thích Các Khái Niệm Standard Go Layout

Tài liệu này cung cấp sơ đồ cấu trúc thư mục mới nhất của dự án (sau khi gom các package vào thư mục `internal/`, tối ưu hóa phân tầng `repository/` và `services/`), đồng thời giải thích mục đích của các thư mục gợi ý khác như `cmd/`, `pkg/`, và `migrations/`.

---

## 1. Sơ Đồ Cấu Trúc Thư Mục Hiện Tại (Directory Tree)

```text
protect-user-backend/
├── docs/                   # Tài liệu hướng dẫn của dự án (Documentation)
│   ├── project_structure.md # Bản vẽ cấu trúc thư mục này
│   └── security_headers.md  # Tài liệu phân tích HTTP Security Headers
├── internal/               # Toàn bộ mã nguồn nghiệp vụ private của dự án
│   ├── config/             # Cấu hình hệ thống (Configuration)
│   │   ├── config.go
│   │   └── default.go
│   ├── dto/                # Các đối tượng truyền dữ liệu (Data Transfer Objects)
│   │   ├── request/        # Chứa các Request DTO (Client gửi lên)
│   │   │   ├── report.go
│   │   │   ├── scam_user.go
│   │   │   └── url.go
│   │   └── response/       # Chứa các Response DTO (Server trả về)
│   │       ├── scammer.go
│   │       └── url.go
│   ├── interfaces/         # HTTP Layer (Giao diện giao tiếp ngoại vi)
│   │   ├── handlers/       # Tầng điều khiển HTTP (HTTP Controllers)
│   │   │   ├── report_handler.go
│   │   │   ├── scamuser_handler.go
│   │   │   └── url_handler.go
│   │   ├── middleware/     # Các bộ lọc trung gian (HTTP Middlewares)
│   │   │   ├── auth.go
│   │   │   ├── body_limit.go
│   │   │   ├── cors.go
│   │   │   ├── ip_whitelist.go
│   │   │   ├── rate_limit.go
│   │   │   ├── security_headers.go
│   │   │   └── timeout.go
│   │   └── router/         # Cấu hình định tuyến (HTTP Routing)
│   │       ├── handler.base.go
│   │       ├── router.go
│   │       └── api/
│   │           ├── report.go
│   │           ├── scamuser.go
│   │           └── url.go
│   ├── models/             # Các thực thể dữ liệu (Data Entities / DB Schemas)
│   │   ├── entity.log.go
│   │   ├── entity.report.go
│   │   ├── entity.request.go
│   │   ├── entity.scammer.go
│   │   └── scam_url.go
│   ├── infrastructure/     # Tầng hạ tầng kỹ thuật (DB, Cache, Repositories, External APIs)
│   │   ├── cache/          # Tầng quản lý bộ nhớ đệm (Cache)
│   │   │   ├── cache.go
│   │   │   └── memory.go
│   │   ├── database/       # Kết nối cơ sở dữ liệu (Database Connection)
│   │   │   └── mongodb.go
│   │   └── repository/     # Tầng truy cập dữ liệu (Data Access / Repository Pattern)
│   │       ├── report/     # Phân hệ lưu trữ báo cáo lừa đảo (Collection 'reports')
│   │       │   ├── constants.go
│   │       │   └── repository.go
│   │       ├── scamuser/   # Phân hệ lưu trữ hồ sơ Scammer (Collection 'scammers')
│   │       │   ├── constants.go
│   │       │   └── repository.go
│   │       └── url/        # Phân hệ lưu trữ URL bị chặn & check logs
│   │           ├── constants.go
│   │           └── repository.go
│   ├── services/           # Tầng xử lý logic nghiệp vụ cốt lõi (Business Logic)
│   │   ├── report/         # Nghiệp vụ duyệt báo cáo, tự động gộp hồ sơ & kích hoạt block
│   │   │   └── service.go
│   │   ├── scamuser/       # Nghiệp vụ chuẩn hóa & tra cứu đối tượng lừa đảo
│   │   │   └── service.go
│   │   └── url/            # Nghiệp vụ chuẩn hóa URL, điều phối cache & singleflight
│   │       └── service.go
│   └── utils/              # Thư viện tiện ích (Helper utilities)
│       └── validator.go
├── .env                    # Lưu trữ các biến môi trường thực tế (Local Config)
├── .env.example            # Bản mẫu cấu hình môi trường để tham khảo
├── .gitignore              # Chỉ thị Git bỏ qua các tệp tạm, logs, build outputs
├── go.mod                  # Quản lý các dependencies/modules của Go
├── go.sum                  # Mã checksum xác minh tính toàn vẹn của các thư viện
└── main.go                 # Tệp khởi chạy ứng dụng & quản lý Graceful Shutdown
```

---

## 2. Kiểm Tra Hoạt Động của Tệp `.env`
Khi các thư mục được chuyển vào trong thư mục `internal/`, tệp `.env` nằm ở thư mục gốc **vẫn hoạt động bình thường**.
*   **Lý do**: Thư viện `godotenv.Load()` (tại [internal/config/config.go](file:///c:/Users/vkhai/OneDrive/Desktop/protect user backend go/internal/config/config.go#L31)) được gọi khi ứng dụng chạy. Trình chạy ứng dụng sẽ tìm tệp `.env` dựa theo **Thư mục làm việc hiện tại (Current Working Directory - CWD)**. 
*   Khi bạn chạy lệnh từ thư mục gốc của dự án (`go run main.go`), CWD chính là thư mục gốc, nơi tệp `.env` đang được lưu trữ, do đó tệp này được tải hoàn toàn chính xác.

---

## 3. Tối Ưu Hóa Phân Tầng Hệ Thống (Repository & Services Modularization)
Để chuẩn hóa dự án phục vụ cho việc dễ đọc hiểu, mở rộng (scale) và tối ưu lập trình Go chuyên nghiệp, hệ thống đã cấu hình phân rã tầng `repository/` và tầng `services/` thành các package con độc lập theo nghiệp vụ:

### 3.1. Phân tầng `repository/`
*   Chia thành `repository/report`, `repository/scamuser`, và `repository/url`.
*   Mỗi module tự quản lý hằng số tên Collection (`constants.go`) và các phương thức truy vấn (`repository.go`) của nó, giúp mã nguồn cô lập và độc lập tối đa.

### 3.2. Phân tầng `services/`
*   Tương tự, được chia thành các thư mục `services/report`, `services/scamuser`, và `services/url`.
*   Mỗi package cung cấp một interface `Service` độc lập.
*   **Idiomatic Go**: Cách đặt tên gói dịch vụ và interface trở nên ngắn gọn, dễ hiểu (ví dụ: `url.Service` thay vì `services.URLCheckerService`, khởi tạo bằng `url.New(...)` thay vì `services.NewURLCheckerService(...)`).

---

## 4. Giải Thích Ý Nghĩa Các Thư Mục Gợi Ý (`cmd/`, `pkg/`, `migrations/`)

Trong chuẩn cấu trúc dự án Go phổ biến (Standard Go Project Layout), ba thư mục này có tác dụng như sau:

### 4.1. Thư mục `cmd/` (Command)
*   **Mục đích**: Chứa các file `main.go` và các điểm khởi chạy chính cho mỗi ứng dụng (executables).
*   **Cách hoạt động**: Nếu dự án của bạn phình to ra và có nhiều chương trình chạy độc lập sử dụng chung mã nguồn (ví dụ: một API server, một CLI tool quản trị, một background worker chạy cron job), bạn sẽ tách chúng ra như sau:
    ```text
    cmd/
    ├── api-server/         # Chạy API chính
    │   └── main.go
    ├── cli-admin/          # Tool quản trị bằng dòng lệnh
    │   └── main.go
    └── cron-cleaner/       # File chạy dọn dẹp DB tự động định kỳ
        └── main.go
    ```
*   **Khuyên dùng đối với dự án này**: Hiện tại dự án của bạn chỉ có duy nhất một file khởi chạy `main.go` ở thư mục gốc. Bạn có thể giữ nguyên ở gốc cho đơn giản, hoặc chuyển file `main.go` hiện tại vào thư mục `cmd/server/main.go` nếu có kế hoạch viết thêm các CLI tools khác.

### 4.2. Thư mục `pkg/` (Package)
*   **Mục đích**: Chứa mã nguồn thư viện dùng chung mà **các dự án khác có thể import và sử dụng được**.
*   **Điểm khác biệt với `internal/`**:
    *   Mọi thư mục nằm trong `internal/` được trình biên dịch Go bảo vệ, **chỉ có ứng dụng trong dự án này được phép import**. Các dự án khác ở ngoài cố import mã nguồn trong `internal/` sẽ bị báo lỗi biên dịch ngay lập tức.
    *   Mã nguồn trong `pkg/` thì công khai, bất kỳ dự án Go nào khác ngoài Internet cũng có thể import về dùng.
*   **Khuyên dùng đối với dự án này**: Do đây là dự án Backend độc lập, toàn bộ logic từ cache, database, config, đến models đều là nghiệp vụ riêng tư của ứng dụng, không nhằm mục đích chia sẻ cho người khác import làm thư viện. Do đó, việc gom tất cả vào **`internal/` là hoàn toàn chính xác và an toàn nhất**.

### 4.3. Thư mục `migrations/` (Database Migrations)
*   **Mục đích**: Chứa các tập lệnh thay đổi cấu trúc dữ liệu (schema) hoặc dữ liệu mẫu của Database qua từng phiên bản.
*   **Cách hoạt động**:
    *   Đối với SQL (Postgres, MySQL): Thư mục này chứa các file `.sql` (ví dụ: `0001_create_users_table.up.sql`, `0001_create_users_table.down.sql`) để chạy nâng cấp/hạ cấp bảng dữ liệu.
    *   Đối với MongoDB (NoSQL): Thư mục này có thể chứa các script JS/Go để tạo cấu trúc collections ban đầu, chèn dữ liệu mẫu (seed data) hoặc khởi tạo nâng cấp DB.
*   **Khuyên dùng đối với dự án này**: Hiện tại hệ thống đang sử dụng MongoDB và thực hiện tự động tạo các indexes vật lý (`InitIndexes`) ngay khi ứng dụng khởi chạy trong các file Repository. Nếu sau này bạn cần chạy các scripts cài đặt dữ liệu ban đầu một cách thủ công và bài bản, bạn có thể tạo một folder `migrations/` ở gốc để lưu trữ các tệp lệnh này.
