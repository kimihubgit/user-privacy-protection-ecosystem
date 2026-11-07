# Tài liệu API

## Base URL

```
http://localhost:8000/api/v1
```

---

## Endpoints

### `GET /`

Health check root — kiểm tra server có hoạt động không.

**Response:**
```json
{
  "application": "Phishing Detector",
  "version": "1.0.0",
  "status": "running"
}
```

---

### `GET /api/v1/health`

Health check chi tiết.

**Response `200 OK`:**
```json
{
  "status": "ok"
}
```

---

### `POST /api/v1/analyze`

Phân tích một URL để phát hiện phishing / nội dung độc hại.

#### Request Body

```json
{
  "url": "https://example.com"
}
```

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `url` | `string (HttpUrl)` | ✅ | URL cần phân tích (phải có scheme http/https) |

#### Response `200 OK`

```json
{
  "analysis_type": "LLM",
  "source": "AI Analysis",
  "risk_score": 85,
  "status": "malicious",
  "level": "High",
  "confidence": 0.92,
  "categories": ["Phishing", "Banking"],
  "indicators": ["Fake Login", "Brand Impersonation", "Credential Harvesting"],
  "reason": [
    "Trang web giả mạo Vietcombank với form đăng nhập thu thập OTP, domain mới tạo 3 ngày."
  ],
  "checks": {
    "collector": {
      "url": "https://vcb-secure.xyz/login",
      "hostname": "vcb-secure.xyz",
      "domain": "vcb-secure.xyz",
      "final_url": "https://vcb-secure.xyz/login",
      "status_code": 200,
      "content_type": "text/html; charset=utf-8",
      "title": "Đăng nhập VCB Digibank",
      "ipv4": ["185.220.101.47"],
      "ipv6": [],
      "redirect_chain": [],
      "response_headers": {
        "Server": "nginx",
        "Content-Type": "text/html; charset=utf-8"
      }
    }
  }
}
```

#### Mô tả các trường response

| Field | Type | Mô tả |
|---|---|---|
| `analysis_type` | `string` | `"OSINT"`, `"LLM"`, hoặc `"Fallback"` |
| `source` | `string` | `"ChongLuaDao"`, `"AI Analysis"`, hoặc `"Fallback"` |
| `risk_score` | `integer` | Điểm rủi ro từ 0 đến 100 |
| `status` | `string` | `"safe"` hoặc `"malicious"` |
| `level` | `string` | `"Low"`, `"Medium"`, hoặc `"High"` |
| `confidence` | `float` | Độ tin cậy của kết quả (0.0 – 1.0) |
| `categories` | `string[]` | Danh mục website (xem bảng bên dưới) |
| `indicators` | `string[]` | Dấu hiệu nguy hiểm phát hiện được |
| `reason` | `string[]` | Lý do kết luận (tối đa 1 câu) |
| `checks.collector` | `object \| null` | Thông tin thu thập được (null nếu OSINT có kết quả sớm) |

#### Các giá trị `analysis_type`

| Giá trị | Ý nghĩa |
|---|---|
| `OSINT` | Kết quả từ ChongLuaDao (bỏ qua AI) |
| `LLM` | Kết quả phân tích bằng Gemini AI |
| `Fallback` | AI lỗi, sử dụng kết quả dự phòng |

#### Mapping `risk_score` → `status` + `level`

| Risk Score | Status | Level |
|---|---|---|
| 0 – 20 | `safe` | `Low` |
| 21 – 60 | `malicious` | `Medium` |
| 61 – 100 | `malicious` | `High` |

#### Các `categories` hợp lệ

```
Business, Government, Education, News, Forum, Blog,
Social, Shopping, E-commerce, Finance, Banking, Payment,
Insurance, Healthcare, Travel, Logistics, Cloud, Software,
Hosting, Technology, Download, APK, Gaming, Casino,
Sports Betting, Gambling, Lottery, Crypto, Investment,
Forex, Adult, Malware, Unknown
```

#### Các `indicators` hợp lệ

```
Phishing, Scam, Credential Harvesting, Fake Login, Fake Payment,
Fake Banking, Brand Impersonation, Password Collection, OTP Collection,
Email Collection, Casino, Sports Betting, Lottery, Gambling,
Crypto Scam, Investment Scam, Forex Scam, APK Distribution, Malware
```

---

#### Response Errors

| HTTP Code | Khi nào xảy ra |
|---|---|
| `422 Unprocessable Entity` | URL không hợp lệ (không có scheme, sai format) |
| `500 Internal Server Error` | Lỗi không xử lý được trong pipeline |

**Ví dụ lỗi 422:**
```json
{
  "detail": [
    {
      "loc": ["body", "url"],
      "msg": "URL scheme not permitted",
      "type": "value_error.url.scheme"
    }
  ]
}
```

---

## Ví dụ sử dụng

### cURL

```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'
```

### Python (requests)

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/analyze",
    json={"url": "https://google.com"},
)
result = response.json()
print(result["status"])       # "safe"
print(result["risk_score"])   # 0
print(result["analysis_type"]) # "OSINT"
```

### JavaScript (fetch)

```javascript
const response = await fetch("http://localhost:8000/api/v1/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: "https://example.com" }),
});
const result = await response.json();
console.log(result.status); // "safe" hoặc "malicious"
```

---

## Interactive Docs (Swagger UI)

Khi server đang chạy, truy cập:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
