# REST API Specification

Bản tài liệu này mô tả chi tiết các API của hệ thống **Malicious & Scam URL Checker Backend** được thiết kế theo chuẩn RESTful.

## 🔑 Thông Tin Chung & Bảo Mật

* **Base URL:** `http://localhost:8082` (hoặc cổng được định cấu hình qua biến môi trường `PORT` ở file `.env`).
* **Content-Type:** `application/json` cho toàn bộ các request/response có chứa body.
* **Xác thực Admin:** Các API trong nhóm Admin bắt buộc phải có:
  * IP của Client phải nằm trong danh sách được phép (**IP Whitelisting**).
  * Đính kèm Header: `X-API-Key: <YOUR_ADMIN_API_KEY>` (Ví dụ: `X-API-Key: admin-secret-key-123`).

---

## 🗺️ Danh Sách Endpoint

| Nhóm API | Method | Endpoint | Bảo mật | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **Hệ thống** | `GET` | `/` | Công khai | Trang chào mừng hệ thống |
| | `GET` | `/ping` | Công khai | Kiểm tra trạng thái hoạt động (Health Check) |
| **Công khai (Public)** | `POST` | `/api/urls/check` | Công khai (Rate Limit) | Kiểm tra URL/Domain độc hại |
| | `POST` | `/api/scammers/check` | Công khai (Rate Limit) | Kiểm tra đối tượng lừa đảo |
| | `POST` | `/api/reports` | Công khai (Rate Limit) | Gửi báo cáo lừa đảo (URL hoặc Đối tượng) |
| **Quản trị (Admin)** | `GET` | `/api/admin/stats` | Admin (API Key & IP) | Xem thống kê số liệu tổng quan |
| | `POST` | `/api/admin/urls` | Admin (API Key & IP) | Thêm thủ công URL độc hại vào blocklist |
| | `GET` | `/api/admin/urls` | Admin (API Key & IP) | Lấy danh sách URL độc hại (Phân trang) |
| | `DELETE`| `/api/admin/urls/:id` | Admin (API Key & IP) | Xóa URL độc hại khỏi danh sách |
| | `POST` | `/api/admin/scammers` | Admin (API Key & IP) | Thêm thủ công đối tượng lừa đảo vào blocklist |
| | `GET` | `/api/admin/scammers` | Admin (API Key & IP) | Lấy danh sách đối tượng lừa đảo (Phân trang) |
| | `DELETE`| `/api/admin/scammers/:id`| Admin (API Key & IP) | Xóa đối tượng lừa đảo khỏi danh sách |
| | `GET` | `/api/admin/reports` | Admin (API Key & IP) | Lấy danh sách báo cáo từ người dùng |
| | `PUT` | `/api/admin/reports/:id/status`| Admin (API Key & IP) | Duyệt hoặc từ chối báo cáo từ người dùng |

---

## 🛠️ Chi Tiết Các Endpoint

### 1. Hệ Thống

#### GET `/`
* **Mô tả:** Trả về thông điệp chào mừng và trạng thái hệ thống.
* **Response (200 OK):**
  ```json
  {
    "message": "Welcome to the Go Protect User API",
    "status": "OK"
  }
  ```

#### GET `/ping`
* **Mô tả:** Trả về văn bản kiểm tra sức khỏe của server.
* **Response (200 OK):**
  ```text
  pong
  ```

---

### 2. Nhóm API Công Khai (Public API)

#### POST `/api/urls/check`
* **Mô tả:** Kiểm tra độ an toàn của một URL hoặc Domain. Tự động áp dụng cơ chế chuẩn hóa URL và bộ lọc Heuristics để phát hiện chuỗi từ khóa nhạy cảm.
* **Request Body:**
  ```json
  {
    "url": "vietcombank-login-update.xyz"
  }
  ```
* **Response (200 OK - Không độc hại):**
  ```json
  {
    "is_scam": false,
    "heuristics_match": false,
    "source": "none",
    "details": null
  }
  ```
* **Response (200 OK - Phát hiện độc hại từ Blocklist):**
  ```json
  {
    "is_scam": true,
    "heuristics_match": false,
    "source": "blocklist",
    "details": {
      "category": "phishing",
      "description": "Giả mạo trang đăng nhập ngân hàng"
    }
  }
  ```

#### POST `/api/scammers/check`
* **Mô tả:** Kiểm tra xem số tài khoản ngân hàng, số điện thoại hoặc tài khoản mạng xã hội có nằm trong danh sách lừa đảo không.
* **Request Body:**
  ```json
  {
    "target": "0987654321"
  }
  ```
* **Response (200 OK - Phát hiện lừa đảo):**
  ```json
  {
    "target": "0987654321",
    "is_scam": true,
    "scammer": {
      "id": "6a3506cbac98489cf7524227",
      "contact": {
        "telegram": [
          { "username": "telegram.me/kjhdkhsdf" }
        ],
        "facebook": [
          { "link": "facebook.com/scammer123", "name": "NGUYEN VAN A" }
        ],
        "phone": [
          { "full_number": "0987654321" }
        ]
      }
    },
    "incidents": [
      {
        "id": "6a3506cbac98489cf7524229",
        "ref": {
          "report_id": "6a350685ac98489cf7524226",
          "scammer_id": "6a3506cbac98489cf7524227"
        },
        "victim_ids": ["6a3506cbac98489cf7524228"],
        "date": "2026-06-19",
        "status": "approved",
        "type": "scam",
        "losses": [
          { "amount": 200000, "currency": "VND" }
        ],
        "description": "Bi lua 200k qua Telegram"
      }
    ]
  }
  ```

#### POST `/api/reports`
* **Mô tả:** Người dùng gửi báo cáo lừa đảo lên hệ thống (báo cáo URL độc hại hoặc Đối tượng lừa đảo).
* **Request Body:**
  * **Trường hợp báo cáo URL (`type` = 1):**
    ```json
    {
      "type": 1,
      "reporter": {
        "name": "Nguyen Van B",
        "role": "victim",
        "contact": [
          {
            "type": "email",
            "value": "victim@example.com"
          }
        ]
      },
      "raw": {
        "title": "Trang web giả mạo ví MoMo",
        "url": "https://momo-nhanloc.cc",
        "domain": "momo-nhanloc.cc"
      }
    }
    ```
  * **Trường hợp báo cáo Đối tượng lừa đảo (`type` = 0):**
    ```json
    {
      "type": 0,
      "reporter": {
        "name": "Trần Thị C",
        "role": "visitor",
        "contact": [
          {
            "type": "phone",
            "value": "0912345678"
          }
        ]
      },
      "raw": {
        "title": "Đối tượng lừa đảo số tài khoản Techcombank",
        "detail": "Đối tượng dụ dỗ chuyển khoản tiền cọc phòng trọ sau đó chặn liên lạc",
        "losses": [
          {
            "amount": 2000000,
            "currency": "VND"
          }
        ],
        "other": {
          "phone": ["0987654321"],
          "name": ["Lê Văn D"],
          "social": ["facebook.com/levand.scam"]
        }
      }
    }
    ```
* **Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": {
      "message": "Report successfully submitted and pending admin review"
    }
  }
  ```

---

### 3. Nhóm API Quản Trị (Admin API)

> [!IMPORTANT]
> Tất cả các API dưới đây yêu cầu Header: `X-API-Key: <token>` và IP được Whitelist.

#### GET `/api/admin/stats`
* **Mô tả:** Lấy thông tin thống kê tổng quát của hệ thống (lượt truy vấn, số lượng URL/Scammer trong blocklist, danh mục vi phạm).
* **Response (200 OK):**
  ```json
  {
    "total_urls_blocked": 1420,
    "total_scammers_blocked": 580,
    "total_checks_logged": 12850,
    "categories_distribution": {
      "phishing": 850,
      "scam": 450,
      "malware": 120
    }
  }
  ```

#### POST `/api/admin/urls`
* **Mô tả:** Thêm thủ công một URL độc hại vào cơ sở dữ liệu blocklist.
* **Request Body:**
  ```json
  {
    "url": "https://momo-nhanqua-he2026.com",
    "category": "scam",
    "description": "Lừa đảo nhận thưởng qua ví MoMo"
  }
  ```
  * `category` hợp lệ: `phishing`, `scam`, `malware`, `gambling`, `fake_news`, `none`.
* **Response (201 Created):**
  ```json
  {
    "message": "Scam URL successfully added",
    "data": {
      "id": "6491a999...",
      "url": "momo-nhanqua-he2026.com",
      "category": "scam",
      "description": "Lừa đảo nhận thưởng qua ví MoMo",
      "reported_by": "admin",
      "created_at": "2026-06-19T11:43:00Z"
    }
  }
  ```

#### GET `/api/admin/urls`
* **Mô tả:** Lấy danh sách các URL độc hại trong blocklist (có phân trang và bộ lọc).
* **Query Parameters:**
  * `page` (optional, default: `1`)
  * `limit` (optional, default: `20`)
  * `status` (optional, ví dụ: `malicious`)
* **Response (200 OK):**
  ```json
  {
    "page": 1,
    "limit": 2,
    "total": 142,
    "data": [
      {
        "id": "6491a999...",
        "url": "momo-nhanqua-he2026.com",
        "category": "scam"
      }
    ]
  }
  ```

#### DELETE `/api/admin/urls/:id`
* **Mô tả:** Xóa một URL ra khỏi blocklist theo ID.
* **Response (200 OK):**
  ```json
  {
    "message": "Scam URL entry deleted successfully"
  }
  ```

#### POST `/api/admin/scammers`
* **Mô tả:** Thêm thủ công một đối tượng lừa đảo vào cơ sở dữ liệu.
* **Request Body:**
  ```json
  {
    "target": "19035678912345",
    "type": "bank_account",
    "name": "NGUYEN VAN A",
    "bank_name": "Techcombank",
    "description": "Dụ dỗ mua xe máy giá rẻ cọc tiền rồi trốn"
  }
  ```
  * `type` hợp lệ: `bank_account`, `phone`, `facebook`, `telegram`, `zalo`, `other`.
* **Response (201 Created):**
  ```json
  {
    "message": "Scammer successfully added to blocklist",
    "data": {
      "id": "6491c...",
      "target": "19035678912345",
      "type": "bank_account",
      "name": "NGUYEN VAN A",
      "bank_name": "Techcombank",
      "description": "Dụ dỗ mua xe máy giá rẻ cọc tiền rồi trốn",
      "status": "malicious"
    }
  }
  ```

#### GET `/api/admin/scammers`
* **Mô tả:** Lấy danh sách các đối tượng lừa đảo trong hệ thống.
* **Query Parameters:**
  * `page` (optional, default: `1`)
  * `limit` (optional, default: `20`)
  * `type` (optional, ví dụ: `bank_account`)
* **Response (200 OK):**
  ```json
  {
    "page": 1,
    "limit": 20,
    "total": 58,
    "data": [
      {
        "id": "6491c...",
        "target": "19035678912345",
        "type": "bank_account",
        "name": "NGUYEN VAN A"
      }
    ]
  }
  ```

#### DELETE `/api/admin/scammers/:id`
* **Mô tả:** Xóa thông tin đối tượng lừa đảo khỏi hệ thống theo ID.
* **Response (200 OK):**
  ```json
  {
    "message": "Scammer entry deleted successfully"
  }
  ```

#### GET `/api/admin/reports`
* **Mô tả:** Lấy danh sách các báo cáo do người dùng gửi lên.
* **Query Parameters:**
  * `page` (optional, default: `1`)
  * `limit` (optional, default: `20`)
  * `status` (optional, ví dụ: `pending`, `approved`, `rejected`)
  * `type` (optional, `0` cho Scammer, `1` cho URL)
* **Response (200 OK):**
  ```json
  {
    "page": 1,
    "limit": 10,
    "total": 5,
    "data": [
      {
        "id": "6491b...",
        "type": 1,
        "status": "pending",
        "raw": {
          "title": "Trang web giả mạo ví MoMo",
          "url": "https://momo-nhanloc.cc"
        }
      }
    ]
  }
  ```

#### PUT `/api/admin/reports/:id/status`
* **Mô tả:** Duyệt (approve) hoặc Từ chối (reject) báo cáo. Khi phê duyệt (`approved`), hệ thống sẽ tự động thêm URL hoặc Đối tượng lừa đảo đó vào cơ sở dữ liệu blocklist tương ứng.
* **Request Body:**
  ```json
  {
    "status": "approved"
  }
  ```
  * `status` hợp lệ: `approved`, `rejected`.
* **Response (200 OK):**
  ```json
  {
    "message": "Report status updated successfully"
  }
  ```

---

## 🚫 Định Dạng Phản Hồi Lỗi Chuẩn (Error Responses)

Khi xảy ra lỗi (nhập liệu sai, thiếu API Key, không có quyền IP, hoặc lỗi Server), hệ thống sẽ trả về định dạng JSON chuẩn:

#### Lỗi xác thực hoặc không đủ quyền (401 Unauthorized / 403 Forbidden / 404 Not Found)
```json
{
  "status": "error",
  "message": "API endpoint not found"
}
```

#### Lỗi nhập liệu không hợp lệ (400 Bad Request)
```json
{
  "error": "Dữ liệu không hợp lệ"
}
```

#### Lỗi hệ thống phía Server (500 Internal Server Error)
```json
{
  "error": "connection failed: database not reachable"
}
```
