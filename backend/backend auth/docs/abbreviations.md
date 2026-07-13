# Thuật Ngữ & Từ Viết Tắt (Glossary & Abbreviations)

Tài liệu này tổng hợp và giải thích các thuật ngữ, từ viết tắt công nghệ được sử dụng trong mã nguồn và kiến trúc của dự án `API Protect User`.

---

## 1. Tầng Kiến Trúc & Thiết Kế (Architecture & Design Patterns)

| Thuật ngữ | Tên đầy đủ | Ý nghĩa / Giải thích |
| :--- | :--- | :--- |
| **DTO** | Data Transfer Object | Đối tượng chuyển dữ liệu. Chỉ chứa dữ liệu tĩnh và cấu trúc JSON, dùng để truyền nhận thông tin giữa Client-Server hoặc giữa các tầng (Layer) mà không mang logic nghiệp vụ. |
| **DIP** | Dependency Inversion Principle | Nguyên lý đảo ngược phụ thuộc. Một trong 5 nguyên lý SOLID, phát biểu rằng các module cấp cao (Service/UseCase) không nên phụ thuộc vào module cấp thấp (DB/Infrastructure), mà cả hai nên phụ thuộc vào sự trừu tượng (Interface). |
| **DI** | Dependency Injection | Tiêm phụ thuộc. Kỹ thuật truyền các dependencies (như database connection, repository) từ ngoài vào trong struct (qua Constructor) thay vì khởi tạo trực tiếp bên trong. |
| **DAO** | Data Access Object | Đối tượng truy cập dữ liệu. Gần tương đương với Repository, chịu trách nhiệm kết nối trực tiếp với DB để đọc/ghi dữ liệu. |
| **CRUD** | Create, Read, Update, Delete | Bốn thao tác cơ bản với dữ liệu: Thêm mới, Đọc, Cập nhật, Xóa. |

---

## 2. Xác Thực & Bảo Mật (Authentication & Security)

| Thuật ngữ | Tên đầy đủ | Ý nghĩa / Giải thích |
| :--- | :--- | :--- |
| **JWT** | JSON Web Token | Token mã hóa dạng chuỗi JSON dùng để xác thực quyền truy cập của người dùng mà không cần lưu session trên server. |
| **OAuth** | Open Authorization | Chuẩn ủy quyền mở. Cho phép người dùng đăng nhập thông qua các nhà cung cấp bên thứ ba (Google, GitHub, Microsoft, Telegram...). |
| **Passkey / WebAuthn** | Web Authentication | Chuẩn bảo mật web cho phép đăng nhập bằng sinh trắc học (vân tay, khuôn mặt) hoặc mã PIN phần cứng thay thế cho mật khẩu truyền thống. |
| **PEM** | Privacy-Enhanced Mail | Định dạng file mã hóa (thường có phần mở rộng `.pem`, chứa khóa RSA công khai/riêng tư dạng chữ số Base64 bắt đầu bằng `-----BEGIN ...-----`). |
| **TTL** | Time To Live | Thời gian tồn tại của dữ liệu. Được dùng trong MongoDB Index để tự động xóa bản ghi (VD: BlacklistedToken hết hạn). |

---

## 3. WebAuthn / Passkeys Specific (Thuật ngữ chuyên sâu Passkey)

| Thuật ngữ | Tên đầy đủ | Ý nghĩa / Giải thích |
| :--- | :--- | :--- |
| **RP** | Relying Party | Bên tin cậy / Bên xác thực. Chính là ứng dụng/server của bạn (đóng vai trò xác thực thông tin khóa từ thiết bị của khách hàng). |
| **RPID** | Relying Party Identifier | Định danh của RP. Thường là domain chính của website (ví dụ: `auth.domain.com` hoặc localhost) đăng ký sử dụng Passkey. |
| **RP Origins** | Relying Party Origins | Danh sách các tên miền nguồn được phép gửi yêu cầu xác thực Passkey (ví dụ: `https://domain.com`). |

---

## 4. Giao Thức Mạng & Hệ Thống (Network & Infrastructure)

| Thuật ngữ | Tên đầy đủ | Ý nghĩa / Giải thích |
| :--- | :--- | :--- |
| **IP** | Internet Protocol | Địa chỉ IP của Client gửi yêu cầu. |
| **UA** | User Agent | Chuỗi ký tự định danh thông tin trình duyệt, hệ điều hành của Client (dùng để ghi log đăng nhập bảo mật). |
| **CORS** | Cross-Origin Resource Sharing | Cơ chế chia sẻ tài nguyên nguồn chéo. Quy định trình duyệt web ở domain này có được phép gọi API ở domain khác hay không. |
| **CSP** | Content Security Policy | Chính sách bảo mật nội dung. Ngăn chặn các cuộc tấn công XSS và chèn mã độc. |
| **HSTS** | HTTP Strict Transport Security | Chính sách bắt buộc trình duyệt chỉ được giao tiếp với server qua kết nối an toàn HTTPS. |
