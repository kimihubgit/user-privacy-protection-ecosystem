# Hướng Dẫn Kiểm Thử Bảo Mật API (API Security & Pen-Testing Guide)

Tài liệu này hướng dẫn cách thực hiện kiểm thử bảo mật và giả lập các kịch bản tấn công (Test Cases) đối với các API trong hệ thống **Malicious & Scam URL Checker Backend**.

---
{
  "type": null,
  "reporter": null,
  "raw": null
}
## 🛡️ Tổng Quan Kiến Trúc Bảo Mật

Hệ thống bảo mật API dựa trên 5 lớp middleware và quy trình xác thực chính:
1. **IP Whitelisting Middleware** ([middleware/ip_whitelist.go](file:///c:/Users/vkhai/OneDrive/Desktop/protect%20user%20backend%20go/middleware/ip_whitelist.go)): Giới hạn IP truy cập các API Admin.
2. **API Key Authentication** ([middleware/middleware.auth.go](file:///c:/Users/vkhai/OneDrive/Desktop/protect%20user%20backend%20go/middleware/middleware.auth.go)): Yêu cầu mã khóa bí mật ở Header `X-API-Key`.
3. **Rate Limiting** ([middleware/rate_limit.go](file:///c:/Users/vkhai/OneDrive/Desktop/protect%20user%20backend%20go/middleware/rate_limit.go)): Chống Spam/DoS bằng thuật toán Token Bucket.
4. **Timeout Limit** ([middleware/timeout.go](file:///c:/Users/vkhai/OneDrive/Desktop/protect%20user%20backend%20go/middleware/timeout.go)): Hủy kết nối sau 10 giây nếu client treo luồng dữ liệu.
5. **Input Validation & NoSQL Injection Prevention**: Sử dụng thư viện `validator` của Go/Gin và MongoDB Driver chính thức tránh việc nối chuỗi truy vấn trực tiếp.

---

## 🧪 Các Kịch Bản Kiểm Thử & Lệnh Giả Lập

### 1. Kiểm Thử Xác Thực Admin (API Key)
* **Mục tiêu:** Đảm bảo toàn bộ API quản trị nằm dưới nhóm `/api/admin/*` không bị rò rỉ dữ liệu khi thiếu khóa hoặc dùng khóa sai.

| ID | Tên Test Case | Mô tả kiểm thử | Phản hồi mong đợi |
| :--- | :--- | :--- | :--- |
| **TC-1.1** | Thiếu Header API Key | Gọi API Admin nhưng không truyền header `X-API-Key`. | `401 Unauthorized`<br>`{"error": "Missing X-API-Key header"}` |
| **TC-1.2** | API Key không chính xác | Truyền header `X-API-Key` với giá trị ngẫu nhiên sai lệch. | `401 Unauthorized`<br>`{"error": "Invalid API Key"}` |
| **TC-1.3** | Xác thực thành công | Truyền header `X-API-Key` đúng giá trị cấu hình (ví dụ: `admin-secret-key-123`). | `200 OK` hoặc `201 Created` kèm dữ liệu. |

#### Lệnh giả lập kiểm thử (Git Bash / CMD):
```bash
# TC-1.1: Thiếu Header API Key
curl -i -X GET http://localhost:8082/api/admin/stats

# TC-1.2: API Key không chính xác
curl -i -X GET http://localhost:8082/api/admin/stats -H "X-API-Key: keysai123"

# TC-1.3: Xác thực thành công (Lưu ý: IP của bạn phải nằm trong Whitelist để chạy lệnh này)
curl -i -X GET http://localhost:8082/api/admin/stats -H "X-API-Key: admin-secret-key-123"
```

---

### 2. Kiểm Thử Giới Hạn IP (IP Whitelisting)
* **Mục tiêu:** Đảm bảo chỉ các địa chỉ IP quản trị được liệt kê trong biến `ADMIN_ALLOWED_IPS` mới có thể gọi tới các endpoint `/api/admin/*`. Các IP ngoài danh sách sẽ bị phản hồi giả lập `404` để bảo mật cấu trúc hệ thống.

| ID | Tên Test Case | Mô tả kiểm thử | Phản hồi mong đợi |
| :--- | :--- | :--- | :--- |
| **TC-2.1** | IP không nằm trong whitelist | Sử dụng một IP khác (không phải `127.0.0.1` hoặc IP cấu hình) để truy cập. | `404 Not Found`<br>`{"status": "error", "message": "API endpoint not found"}` |
| **TC-2.2** | Tấn công giả lập Header IP (IP Spoofing) | Gửi request từ bên ngoài nhưng đính kèm các Header giả IP như `X-Forwarded-For: 127.0.0.1` hoặc `X-Real-IP`. | `404 Not Found` (Hệ thống phải dùng IP gốc từ kết nối mạng của TCP chứ không tin tưởng Header của Client). |

#### Lệnh giả lập kiểm thử:
```bash
# Giả lập tấn công IP Spoofing qua Header (Hệ thống sẽ từ chối nếu code bảo mật tốt)
curl -i -X GET http://localhost:8082/api/admin/stats \
  -H "X-API-Key: admin-secret-key-123" \
  -H "X-Forwarded-For: 127.0.0.1" \
  -H "X-Real-IP: 127.0.0.1"
```

---

### 3. Kiểm Thử Giới Hạn Tần Suất (Rate Limiting)
* **Mục tiêu:** Bảo vệ API công khai (như `/api/reports` với giới hạn 10 req/giây và `/api/urls/check` với 5 req/giây) tránh bị tấn công từ chối dịch vụ (DoS) hoặc cào dữ liệu hàng loạt.

| ID | Tên Test Case | Mô tả kiểm thử | Phản hồi mong đợi |
| :--- | :--- | :--- | :--- |
| **TC-3.1** | Tần suất bình thường | Gửi yêu cầu với tần suất dưới mức giới hạn tối đa. | Phản hồi thành công bình thường. |
| **TC-3.2** | Tấn công brute-force / spam | Gửi liên tục hàng chục request cùng lúc từ một máy trạm. | Từ request vượt ngưỡng giới hạn, server trả về `429 Too Many Requests`<br>`{"error": "Too many requests. Please slow down."}` |

#### Lệnh giả lập kiểm thử (PowerShell - gửi nhanh 15 request cùng lúc):
```powershell
for ($i=1; $i -le 15; $i++) {
    Start-Job -ScriptBlock {
        curl.exe -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8082/api/urls/check `
          -H "Content-Type: application/json" `
          -d '{\"url\": \"test-limit.xyz\"}'
    }
}
Get-Job | Wait-Job | Receive-Job
```
*(Bạn sẽ thấy một số request đầu trả về `200`, các request sau lập tức bị từ chối bằng `429`)*.

---

### 4. Kiểm Thử Tấn Công NoSQL Injection (MongoDB)
* **Mục tiêu:** Xác minh kẻ tấn công không thể bypass kiểm tra hoặc truy xuất toàn bộ dữ liệu bằng cách sử dụng các toán tử logic đặc biệt của MongoDB (như `$ne`, `$gt`, `$or`).

| ID | Tên Test Case | Mô tả kiểm thử | Phản hồi mong đợi |
| :--- | :--- | :--- | :--- |
| **TC-4.1** | NoSQL Injection kiểm tra URL | Gửi payload `"url": {"$ne": ""}` mong muốn trả về trạng thái scam của mọi URL khác rỗng. | `400 Bad Request` hoặc coi `"{"$ne": ""}"` là một chuỗi văn bản thông thường chứ không được thực thi lệnh logic trong DB. |
| **TC-4.2** | NoSQL Injection kiểm tra Scammer | Gửi payload `"target": {"$gt": ""}` mong muốn lấy thông tin scammer. | `400 Bad Request` (Validator của Go chặn đứng vì trường `target` phải là kiểu String chứ không được là Object). |

#### Lệnh giả lập kiểm thử:
```bash
# TC-4.1: Thử tấn công qua JSON lồng toán tử logic
curl -i -X POST http://localhost:8082/api/urls/check \
  -H "Content-Type: application/json" \
  -d '{"url": {"$ne": ""}}'

# Hệ thống sử dụng DTO kiểm định kiểu dữ liệu nghiêm ngặt nên sẽ báo lỗi ValidationError 400 lập tức.
```

---

### 5. Kiểm Thử Định Dạng & Ràng Buộc Dữ Liệu (Data Validation)
* **Mục tiêu:** Ngăn chặn dữ liệu rác, sai cấu trúc được ghi vào cơ sở dữ liệu làm hỏng ứng dụng.

| ID | Tên Test Case | Mô tả kiểm thử | Phản hồi mong đợi |
| :--- | :--- | :--- | :--- |
| **TC-5.1** | Sai giá trị định danh Enum | Báo cáo đối tượng lừa đảo nhưng truyền loại `type` không khớp với các kiểu quy định: `bank_account`, `phone`, `facebook`, `telegram`, `zalo`, `other`. | `400 Bad Request`<br>`{"errors": {"type": "type must be one of [bank_account, phone, facebook, telegram, zalo, other]"}}` |
| **TC-5.2** | Truyền số tiền âm | Báo cáo lừa đảo với số tiền tổn thất `losses.amount` = `-150000`. | `400 Bad Request` (Báo lỗi kiểm định `min=0` của DTO). |

#### Lệnh giả lập kiểm thử:
```bash
# TC-5.2: Gửi số tiền âm
curl -i -X POST http://localhost:8082/api/reports \
  -H "Content-Type: application/json" \
  -d '{"type": 0, "reporter": {"name": "Test", "role": "visitor"}, "raw": {"title": "Test", "losses": [{"amount": -500, "currency": "VND"}]}}'
```

---

### 6. Kiểm Thử Timeout & Treo Kết Nối (Slowloris Attack)
* **Mục tiêu:** Đảm bảo server tự động đóng kết nối (Timeout sau 10 giây) khi máy khách gửi yêu cầu cực kỳ chậm nhằm chiếm dụng băng thông hoặc làm cạn kiệt tài nguyên hệ thống (thread pool).

| ID | Tên Test Case | Mô tả kiểm thử | Phản hồi mong đợi |
| :--- | :--- | :--- | :--- |
| **TC-6.1** | Xử lý lâu quá 10 giây | Yêu cầu bị treo hoặc giữ kết nối quá lâu không gửi đủ body. | Kết nối bị ngắt tự động nhờ [middleware/timeout.go](file:///c:/Users/vkhai/OneDrive/Desktop/protect user backend go/middleware/timeout.go). Trình duyệt hoặc curl nhận về phản hồi `503 Service Unavailable` hoặc ngắt kết nối. |
