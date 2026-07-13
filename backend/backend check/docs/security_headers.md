# Hướng Dẫn Chi Tiết Về Các HTTP Security Headers

Tài liệu này giải thích chi tiết mục đích, ý nghĩa và cấu hình của các HTTP Security Headers được áp dụng trong dự án thông qua middleware **SecurityHeadersMiddleware**.

---

## 1. Danh Sách Các Security Headers Đã Cấu Hình

Dưới đây là bảng tổng hợp các Header bảo mật đang được thiết lập:

| HTTP Header | Giá Trị Cấu Hình | Vai Trò Bảo Mật |
| :--- | :--- | :--- |
| **`X-Content-Type-Options`** | `nosniff` | Chống lỗi MIME-sniffing để ngăn chặn việc thực thi mã nguồn giả mạo định dạng. |
| **`X-Frame-Options`** | `DENY` | Chống tấn công Clickjacking bằng cách cấm nhúng API/Website vào thẻ `<iframe>`. |
| **`Referrer-Policy`** | `strict-origin-when-cross-origin` | Bảo vệ thông tin nhạy cảm nằm trên URL gốc khi chuyển hướng liên kết. |
| **`Content-Security-Policy` (CSP)** | `default-src 'none'; frame-ancestors 'none'` | Cấm tải mọi tài nguyên và cấm làm frame cha; vô hiệu hóa trang web nếu trình duyệt cố render HTML của API. |
| **`Permissions-Policy`** | `accelerometer=(), camera=(), geolocation=(),...` | Vô hiệu hóa toàn bộ quyền truy cập thiết bị phần cứng của Client. |
| **`Strict-Transport-Security` (HSTS)** | `max-age=31536000; includeSubDomains` | Ép buộc sử dụng kết nối bảo mật HTTPS (Chỉ áp dụng ở Production). |

---

## 2. Giải Thích Chi Tiết Từng Header

### 2.1. X-Content-Type-Options: `nosniff`
*   **Vấn đề**: Đôi khi trình duyệt cố gắng đoán định dạng tệp tin (MIME type) bằng cách phân tích nội dung tệp (gọi là MIME-sniffing), bất kể Header `Content-Type` do server trả về là gì. Ví dụ: Kẻ tấn công tải lên một tệp ảnh nhưng thực chất chứa mã Javascript, trình duyệt có thể tự ý thực thi tệp đó như mã Script.
*   **Giải pháp**: Thiết lập `nosniff` bắt buộc trình duyệt phải tuân thủ nghiêm ngặt định dạng do Server khai báo trong `Content-Type`. Nếu server trả về `application/json`, trình duyệt sẽ xử lý nó như JSON và tuyệt đối không cố thực thi nó như Script hay CSS.

### 2.2. X-Frame-Options: `DENY`
*   **Vấn đề (Clickjacking)**: Kẻ tấn công có thể tạo một trang web độc hại và nhúng trang web/API của bạn vào trong một thẻ `<iframe>` trong suốt đặt đè lên một nút bấm vô hại. Khi người dùng click vào nút vô hại đó, thực chất họ đang click vào trang web của bạn mà không hề hay biết.
*   **Giải pháp**: Giá trị `DENY` cấm hoàn toàn mọi trang web khác (và kể cả chính trang web này) nhúng trang của bạn vào thẻ `<iframe>`. Trình duyệt sẽ chặn ngay lập tức hành vi nhúng khung này.

### 2.3. Referrer-Policy: `strict-origin-when-cross-origin`
*   **Vấn đề**: Khi người dùng nhấn vào một liên kết trên trang web để đi sang trang khác, trình duyệt sẽ gửi đi HTTP Header `Referer` chứa URL đầy đủ của trang gốc. URL này có thể vô tình tiết lộ token bí mật hoặc dữ liệu cá nhân.
*   **Giải pháp**:
    *   Khi chuyển hướng sang các trang cùng tên miền (Same-origin): Gửi toàn bộ URL.
    *   Khi chuyển hướng sang tên miền khác (Cross-origin): Chỉ gửi tên miền gốc (Origin) chứ không gửi đường dẫn chi tiết (Path), ví dụ chỉ gửi `https://example.com/` thay vì `https://example.com/check?secret_token=abc`.
    *   Khi chuyển từ HTTPS sang HTTP: Tuyệt đối không gửi bất kỳ thông tin referrer nào.

### 2.4. Content-Security-Policy (CSP): `default-src 'none'; frame-ancestors 'none'`
*   **Mục đích**: CSP là chốt chặn quan trọng nhất để chống lại các lỗ hổng XSS (Cross-Site Scripting) và Data Injection.
*   **Tại sao cấu hình `default-src 'none'`?**
    Vì đây là một REST API, dữ liệu trả về chỉ có định dạng JSON, không bao giờ cần phải tải script, ảnh, css hay kết nối mạng từ phía frontend trình duyệt. Bằng cách cấm toàn bộ (`default-src 'none'`), nếu có lỗi lập trình nào khiến API trả về HTML chứa mã Javascript độc hại, trình duyệt cũng sẽ từ chối thực thi đoạn mã đó.
*   **Tại sao cấu hình `frame-ancestors 'none'`?**
    Tương tự như `X-Frame-Options: DENY` nhưng thuộc tiêu chuẩn mới của CSP, cấm bất kỳ trang web nào nhúng API này vào thẻ frame.

### 2.5. Permissions-Policy
*   **Mục đích**: Giới hạn các tính năng mạnh mẽ của trình duyệt (như camera, vị trí, mic,... ) mà API này không bao giờ sử dụng tới.
*   **Giải pháp**: Gán giá trị trống `()` cho từng quyền. Điều này bảo vệ người dùng cuối và giảm thiểu bề mặt tấn công nếu API này vô tình bị giả mạo.

### 2.6. Strict-Transport-Security (HSTS): `max-age=31536000; includeSubDomains`
*   **Vấn đề (Man-in-the-Middle)**: Khi người dùng gõ `example.com` vào thanh địa chỉ, trình duyệt mặc định gửi request qua HTTP thông thường trước rồi mới chuyển hướng sang HTTPS. Kẻ tấn công có thể chặn kết nối HTTP ban đầu này (gọi là SSL Stripping).
*   **Giải pháp**: HSTS ra lệnh cho trình duyệt ghi nhớ rằng trang này bắt buộc phải kết nối qua HTTPS trực tiếp ngay ở phía Client trong vòng 1 năm (`31536000` giây), bỏ qua hoàn toàn bước kết nối HTTP không an toàn.
*   **Lưu ý**: Chỉ bật ở môi trường **Production (Release Mode)** để tránh gây lỗi khó kết nối khi các lập trình viên đang debug hoặc phát triển ứng dụng ở localhost vốn chạy HTTP.

---

## 3. Cách Thức Hoạt Động Trong Code Go

Middleware này được đăng ký toàn cục trong tệp **router/router.go**:

```go
// Security Headers Middleware
r.Use(middleware.SecurityHeadersMiddleware())
```

Bất kỳ request nào đi qua hệ thống đều sẽ được gắn các headers này trước khi Handler trả kết quả về cho Client.
