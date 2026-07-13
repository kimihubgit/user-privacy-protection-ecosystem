# Tài Liệu Luồng Dữ Liệu Clean Architecture (Backend Auth)

Tài liệu này mô tả luồng đi của dữ liệu (Data Flow) và vòng đời của một Request đi qua các thư mục/tầng cấu trúc đã được tái cấu trúc (refactor) trong dịch vụ `backend auth`.

---

## 1. Sơ Đồ Luồng Đi Của Dữ Liệu (Mermaid Sequence Diagram)

Dưới đây là sơ đồ chu kỳ của một request đi từ Client, qua các tầng xử lý của hệ thống và tương tác với Database theo kiến trúc mới:

```mermaid
sequenceDiagram
    autonumber
    actor Client as Người dùng / Client
    participant Router as SetupRouter (http/router)
    participant Handler as AuthHandler (http/handlers)
    participant Service as auth.Service (services/auth)
    participant DomainRepo as repository.UserRepository (domain/repository)
    participant InfraRepo as user.mongoRepository (infrastructure/repository)
    database MongoDB as MongoDB (database)

    Client->>Router: 1. Gửi HTTP Request (VD: POST /auth/register)
    Router->>Handler: 2. Định tuyến request tới Handler tương ứng
    Handler->>Handler: 3. Parse JSON Body vào request DTO
    Handler->>Service: 4. Gọi hàm nghiệp vụ (VD: Register(ctx, req))
    Service->>Service: 5. Kiểm tra logic nghiệp vụ (mật khẩu, cuckoo filter, blocklist...)
    Service->>DomainRepo: 6. Gọi Repository interface để kiểm tra/lưu trữ (VD: Create(ctx, user))
    Note over DomainRepo, InfraRepo: Dependency Inversion: Service gọi interface thuộc tầng Domain,<br/>nhưng được runtime trỏ tới Implementation của Infrastructure
    DomainRepo->>InfraRepo: 7. Thực thi thông qua Mongo Repository
    InfraRepo->>MongoDB: 8. Lưu/Truy vấn database MongoDB
    MongoDB-->>InfraRepo: 9. Trả kết quả / Lỗi
    InfraRepo-->>Service: 10. Trả lỗi/kết quả thực thể (entity) về Service
    Service->>Service: 11. Tạo JWT Token (nếu đăng ký/đăng nhập thành công)
    Service-->>Handler: 12. Trả về response DTO (AuthResponse)
    Handler-->>Client: 13. Trả về JSON HTTP Response (200 OK / 201 Created)
```

---

## 2. Chi Tiết Vai Trò Và Dòng Chảy Qua Các Thư Mục

### 📂 `internal/dto/` (Data Transfer Objects)
* **Vai trò**: Chứa các cấu trúc dữ liệu thuần để nhận dữ liệu đầu vào từ HTTP request (`request`) và định dạng dữ liệu đầu ra trả về cho Client (`response`).
* **Luồng dữ liệu**: Là điểm bắt đầu (ở dạng request) và kết thúc (ở dạng response) của dòng chảy dữ liệu với Client.

### 📂 `internal/http/` (Handlers, Router, Middleware)
* **Vai trò**: Tiếp nhận request từ bên ngoài, kiểm tra các định dạng HTTP, phân tích tham số và chuyển đổi dữ liệu vào DTO.
* **Quy tắc phụ thuộc**: Chỉ phụ thuộc vào tầng `usecase/services` (ở đây là `auth.Service`) để xử lý logic, không được phép gọi trực tiếp xuống database/repository.
* **Luồng dữ liệu**: Gọi hàm của `auth.Service` bằng cách truyền các cấu trúc dữ liệu DTO và `context.Context`.

### 📂 `internal/services/` (Tầng nghiệp vụ / Use Cases)
* **Vai trò**: Chứa toàn bộ nghiệp vụ cốt lõi của ứng dụng (kiểm tra tính hợp lệ của email/username, so khớp password bằng bcrypt, hash token, ghi log đăng nhập).
* **Quy tắc phụ thuộc**: Chỉ import thực thể nghiệp vụ ở tầng `domain/entity` và gọi các abstract interface ở tầng `domain/repository`. **Tuyệt đối không import bất kỳ package nào từ hạ tầng (`infrastructure`)**.
* **Luồng dữ liệu**: Nhận DTO từ handler -> Xử lý tính toán nghiệp vụ -> Tạo/Cập nhật các thực thể domain (`entity`) -> Gọi interface `domain/repository` để lưu/truy vấn.

### 📂 `internal/domain/entity/` (Thực thể lõi)
* **Vai trò**: Chứa các cấu trúc dữ liệu nghiệp vụ chính (như `User`, `LoginLog`, `BlacklistedToken`).
* **Luồng dữ liệu**: Được truyền qua lại giữa tầng `services/usecases` và tầng `infrastructure/repository`.

### 📂 `internal/domain/repository/` (Interfaces trừu tượng)
* **Vai trò**: Định nghĩa các "hợp đồng" (contracts/interfaces) cho phép tầng nghiệp vụ thao tác với database mà không cần quan tâm cơ sở dữ liệu đó là gì (MongoDB, Postgres, Redis...).
* **Luồng dữ liệu**: Định nghĩa kiểu tham số truyền vào và kiểu trả về là các thực thể ở tầng `entity`.

### 📂 `internal/infrastructure/repository/` (Hiện thực hạ tầng)
* **Vai trò**: Nơi hiện thực hóa (implement) các interface của tầng `domain/repository`. Chứa các câu lệnh truy vấn MongoDB cụ thể (`InsertOne`, `FindOne`, `ReplaceOne`).
* **Quy tắc phụ thuộc**: Import `domain/repository` để thực hiện giao kèo và `domain/entity` để làm kiểu dữ liệu lưu trữ.
* **Luồng dữ liệu**: Nhận entity từ tầng nghiệp vụ -> Ghi/Đọc dữ liệu từ MongoDB driver -> Trả entity hoặc lỗi ngược lên tầng nghiệp vụ.

---

## 3. Lợi Ích Của Luồng Đi Dữ Liệu Này

1. **Độc lập Database**: Nếu bạn muốn đổi từ MongoDB sang MySQL, bạn chỉ cần tạo một thư mục repo mới trong `internal/infrastructure/repository/mysql` thực thi các interface tại `internal/domain/repository`. Hoàn toàn không cần sửa đổi 1 dòng code nào trong `internal/services/` hay `internal/http/`.
2. **Khả năng kiểm thử (Testability)**: Bạn có thể viết unit test cho [register.go](file:///c:/Users/vkhai/OneDrive/Desktop/API%20Protect%20User/backend%20auth/internal/services/auth/register.go) cực kỳ nhanh bằng cách tạo mock UserRepository mà không cần kết nối tới database thật.
