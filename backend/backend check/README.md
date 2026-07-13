# Malicious & Scam URL Checker Backend

Hệ thống kiểm tra URL độc hại, giả mạo (scam/phishing) bằng ngôn ngữ Go và cơ sở dữ liệu MongoDB.

## Tính Năng Nổi Bật

1. **Chuẩn Hóa URL (URL Normalization)**: Loại bỏ các biến thể để tránh scammer vượt qua bộ lọc (loại bỏ `www.`, chuẩn hóa `http/https`, lower-case, chuẩn hóa ports và slashes).
2. **Nhận Diện Thông Minh (Heuristics Check)**: Tự động phân tích các mẫu ký tự đáng ngờ trong tên miền liên quan đến các thương hiệu phổ biến tại Việt Nam và quốc tế (ví dụ: `vietcombank-login`, `momo-nhanqua`, `metamask-verify`).
3. **Quản Lý Blocklist Của Riêng Bạn**: Lưu trữ các URL/domain độc hại do admin cấu hình trực tiếp trong MongoDB.
4. **Lưu Nhật Ký Truy Vấn (Audit Log)**: Ghi lại lịch sử tìm kiếm URL của người dùng để phân tích và thống kê (thông số IP, User Agent, kết quả).
5. **Thống Kê Chi Tiết (Stats/Analytics)**: Cung cấp API tổng hợp dữ liệu thống kê lượt check, biểu đồ phân loại scam bằng MongoDB Aggregation Pipeline.

---

## Kiến Trúc Dự Án

Dự án được thiết kế theo cấu trúc phân tầng sạch sẽ (Clean Repository-Service-Handler Architecture):

*   `main.go`: Điểm khởi chạy ứng dụng & graceful shutdown.
*   `config/`: Nơi load file môi trường `.env`.
*   `database/`: Xử lý kết nối MongoDB client.
*   `models/`: Định nghĩa các cấu trúc dữ liệu lưu trong DB và Request/Response.
*   `repository/`: Tương tác trực tiếp với MongoDB collections & tạo Indexes.
*   `services/`: Chứa nghiệp vụ chuẩn hóa URL, kiểm tra heuristics và logic kiểm tra.
*   `handlers/`: Controllers tiếp nhận và xử lý HTTP Request/Response.
*   `middleware/`: Middleware xác thực API Key cho admin.
*   `router/`: Cấu hình routing bằng Gin-gonic và quản lý CORS.

---

## Cấu Hình Môi Trường (.env)

Tạo file `.env` ở thư mục gốc (đã được tạo sẵn):

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017
MONGO_DB=scam_detector
ADMIN_API_KEY=admin-secret-key-123
```

---

## Khởi Chạy

```bash
# Tải các thư viện liên quan
go mod tidy

# Chạy ứng dụng
go run main.go
```

Ứng dụng sẽ tự động khởi tạo các **Indexes** trong MongoDB để tối ưu hóa hiệu suất truy vấn.

---

## Kiểm Tra API nhanh bằng Curl

### 1. Check URL (Công khai)
```bash
curl -X POST http://localhost:8080/api/urls/check \
  -H "Content-Type: application/json" \
  -d '{"url": "vietcombank-login-update.xyz"}'
```

### 2. Thêm URL độc hại mới (Admin)
```bash
curl -X POST http://localhost:8080/api/admin/urls \
  -H "Content-Type: application/json" \
  -H "X-API-Key: admin-secret-key-123" \
  -d '{"url": "https://momo-gift-free.vip", "status": "malicious", "category": "scam", "description": "Lừa đảo nhận quà Momo"}'
```

### 3. Xem Thống Kê (Admin)
```bash
curl -X GET http://localhost:8080/api/admin/stats \
  -H "X-API-Key: admin-secret-key-123"
```

### 4. Gửi báo cáo URL/Domain lừa đảo (Công khai)
```bash
curl -X POST http://localhost:8080/api/reports \
  -H "Content-Type: application/json" \
  -d '{"url": "https://momo-luckydraw.xyz", "reason": "scam", "description": "Trang web lừa trúng thưởng Momo"}'
```

### 5. Xem danh sách báo cáo (Admin)
```bash
curl -X GET "http://localhost:8080/api/admin/reports?status=pending&page=1&limit=10" \
  -H "X-API-Key: admin-secret-key-123"
```

### 6. Duyệt hoặc từ chối báo cáo (Admin)
```bash
curl -X PUT http://localhost:8080/api/admin/reports/<REPORT_ID>/status \
  -H "Content-Type: application/json" \
  -H "X-API-Key: admin-secret-key-123" \
  -d '{"status": "approved"}' # Hoặc "rejected"
```

### 7. Kiểm tra đối tượng Scammer (Công khai)
```bash
curl -X POST http://localhost:8080/api/scammers/check \
  -H "Content-Type: application/json" \
  -d '{"target": "0987654321"}'
```

### 8. Gửi báo cáo đối tượng Scammer (Công khai)
```bash
curl -X POST http://localhost:8080/api/scammers/report \
  -H "Content-Type: application/json" \
  -d '{
    "target": "19035678912345",
    "type": "bank_account",
    "name": "NGUYEN VAN A",
    "bank_name": "Techcombank",
    "description": "Lừa cọc mua xe máy giá rẻ",
    "evidence_url": "https://imgur.com/screenshot.png"
  }'
```

### 9. Duyệt hoặc từ chối báo cáo Scammer (Admin)
```bash
curl -X PUT http://localhost:8080/api/admin/scammers/reports/<REPORT_ID>/status \
  -H "Content-Type: application/json" \
  -H "X-API-Key: admin-secret-key-123" \
  -d '{"status": "approved"}' # Hoặc "rejected"
```


