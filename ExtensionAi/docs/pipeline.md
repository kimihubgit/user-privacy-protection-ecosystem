# Luồng xử lý Pipeline

## Sơ đồ tổng quan

```
Client
  │
  │  POST /api/v1/analyze  { "url": "https://example.com" }
  ▼
FastAPI Endpoint (analyze.py)
  │
  ▼
AnalyzerService.analyze(url)
  │
  ├─ [Bước 1] OSINTAgent.check(url)
  │       │
  │       ├─ "safe"      ──→ return sớm  { score: 0,   level: Low  }
  │       ├─ "malicious" ──→ return sớm  { score: 100, level: High }
  │       └─ "no result" ──→ tiếp tục ↓
  │
  ├─ [Bước 2] CollectorAgent.collect(url)
  │       │
  │       ├─ HTMLCollector    → html, title, visible_text, status_code
  │       ├─ DNSResolver      → ipv4[], ipv6[]
  │       ├─ WHOISCollector   → domain_age_days, registrar
  │       └─ NetworkCollector → asn, organization
  │
  ├─ [Bước 3] FeatureExtractor.extract(collector)
  │       │
  │       ├─ BrandDetector    → detected_brand, brand_impersonation
  │       ├─ FormDetector     → has_login_form, password/email/otp inputs
  │       ├─ KeywordDetector  → bank/gambling/crypto/phishing keywords
  │       ├─ URLDetector      → suspicious_url, suspicious_keywords
  │       └─ HTMLDetector     → iframe_count, script_count, hidden_elements
  │               ↓
  │       FeatureResult (40+ fields)
  │
  ├─ [Bước 4] AISummaryBuilder.build(...)
  │       → dict 37 fields (gom data từ bước 2+3)
  │
  └─ [Bước 5] AIAnalysisAgent.analyze(summary)
          │
          ├─ PromptBuilder.build(summary)  → Prompt ~2500 ký tự
          ├─ LLMAnalyzer.analyze(prompt)   → Gọi Gemini 2.5 Flash
          ├─ LLMParser.parse(response)     → Parse JSON
          └─ ResponseValidator.validate()  → Normalize, clamp
                  ↓
          { risk_score, status, level, categories, indicators, reason }
```

---

## Chi tiết từng bước

### Bước 1: OSINT Check

**Mục tiêu:** Tra cứu nhanh danh sách đen/trắng. Short-circuit nếu biết kết quả.

**Module:** `usecases/analyzer/osint_agent.py` → `infrastructure/osint/providers/chongluadao_provider.py`

**Luồng:**
1. Normalize URL (strip trailing slash, lowercase hostname)
2. POST đến `https://feeds.chongluadao.vn/checksafe/cld`
3. Parse kết quả: `safe` / `malicious` / `no result`

**Kết quả trả về:**
| Kết quả OSINT | Risk Score | Level | Hành động |
|---|---|---|---|
| `safe` | 0 | Low | Return ngay |
| `malicious` | 100 | High | Return ngay |
| `no result` | — | — | Tiếp tục pipeline |

**Lưu ý:** Timeout = 10 giây. Nếu lỗi → coi như `no result`.

---

### Bước 2: Collect

**Mục tiêu:** Thu thập tất cả dữ liệu cần thiết từ URL.

**Module:** `usecases/analyzer/collector_agent.py`

#### HTMLCollector
- HTTP GET với User-Agent Chrome/138
- Parse HTML bằng `BeautifulSoup` (lxml parser)
- Trích xuất: title, visible_text (đã remove script/style), status_code, redirect chain
- Timeout: 10 giây

#### DNSResolver
- Resolve A record (IPv4) và AAAA record (IPv6)
- Dùng để phát hiện hosting provider, CDN

#### WHOISCollector
- Query WHOIS để lấy `domain_age_days` và `registrar`
- Domain mới (< 30 ngày) là dấu hiệu đáng ngờ

#### NetworkCollector
- Tra cứu IP → ASN, organization
- Hosting trên VPS lạ là dấu hiệu đáng ngờ

---

### Bước 3: Feature Extraction

**Mục tiêu:** Trích xuất các đặc trưng có cấu trúc từ dữ liệu thô.

**Module:** `usecases/feature_extraction/extractor.py`

Các detector chạy **tuần tự**, lỗi ở detector nào chỉ bỏ qua detector đó.

#### BrandDetector
- Index toàn bộ `ALL_BRANDS` (60+ brands từ `data/brands/`) lúc startup
- Tìm alias trong `visible_text` (lowercase)
- Kiểm tra `domain` có khớp official domains không
- Nếu tìm thấy alias nhưng domain không khớp → `brand_impersonation = True`

**Ví dụ:**
```
Text chứa "vietcombank" + domain là "vcb-secure.xyz"
→ detected_brand = "Vietcombank"
→ brand_impersonation = True  ✅ PHÁT HIỆN
```

#### FormDetector
- Đếm `<form>`, `<input type="password">`, `<input type="email">`
- OTP detection: tìm input có `name/placeholder/id` chứa "otp", "pin", "mã", "xác minh"
- External form: `action` attribute bắt đầu bằng `http`

#### KeywordDetector
- So khớp từ khóa theo 6 nhóm: `bank`, `gambling`, `crypto`, `phishing`, `malware`, `payment`
- Trả về danh sách từ khóa tìm được (không chỉ count)

#### URLDetector
- Kiểm tra URL path có chứa từ khóa đáng ngờ: `login`, `verify`, `secure`, `wallet`, `signin`, `confirm`

#### HTMLDetector
- Đếm `<iframe>`, `<script>`
- Đếm hidden elements: thuộc tính `hidden`, style `display:none` hoặc `visibility:hidden`

---

### Bước 4: AI Summary

**Mục tiêu:** Gom data thành dict 37 fields có cấu trúc để gửi cho LLM.

**Module:** `usecases/summary/summary_builder.py`

Không có logic xử lý, chỉ là data transformation:
```
CollectorResult + FeatureResult + WHOIS dict + Network dict → Summary dict
```

---

### Bước 5: AI Analysis

**Mục tiêu:** Đánh giá tổng hợp bằng Gemini LLM.

**Module:** `usecases/analyzer/ai_analysis_agent.py`

#### PromptBuilder
Tạo prompt ~2500 ký tự dạng bảng cấu trúc gồm 5 section:
- `WEBSITE` — domain, title, brand, category, domain_age, registrar, ASN
- `FORM` — login form flags, input counts
- `HTML` — iframe/script/hidden element counts
- `KEYWORDS` — danh sách từ khóa tìm được theo nhóm
- `SCORES` — các điểm số từ feature extraction

Kèm `RULES` (ràng buộc output) và `OUTPUT FORMAT` (JSON schema).

#### LLMAnalyzer (Gemini 2.5 Flash)
- Model: `gemini-2.5-flash` (cấu hình được qua `.env`)
- Output: JSON thuần (yêu cầu trong prompt)

#### LLMParser
- Strip markdown code blocks nếu model vẫn bọc JSON
- `json.loads()` để parse
- Nếu parse lỗi: trả về fallback với `indicators: ["Parse Error"]`

#### ResponseValidator
Chuẩn hóa output đảm bảo luôn có giá trị hợp lệ:
- `risk_score` → clamp 0–100
- `status` → chỉ `"safe"` hoặc `"malicious"` (suy ra từ score nếu sai)
- `level` → chỉ `"Low"`, `"Medium"`, `"High"` (suy ra từ score nếu sai)
- `confidence` → clamp 0.0–1.0
- `reason` → giữ tối đa 1 câu

#### Mapping score → level

| Risk Score | Status | Level |
|---|---|---|
| 0 – 20 | `safe` | Low |
| 21 – 60 | `malicious` | Medium |
| 61 – 100 | `malicious` | High |

---

## Fallback khi AI lỗi

Nếu Gemini API throw exception (timeout, quota, network):

```python
{
    "analysis_type": "Fallback",
    "source": "Fallback",
    "risk_score": 50,
    "status": "malicious",
    "level": "Medium",
    "confidence": 0.30,
    "categories": [feature.predicted_category],
    "indicators": ["LLM unavailable"],
    "reason": ["Không thể kết nối AI. Đã sử dụng kết quả dự phòng."]
}
```

Confidence = 0.30 báo hiệu cho client biết kết quả này kém tin cậy.

---

## Thời gian xử lý ước tính

| Bước | Thời gian | Bottleneck |
|---|---|---|
| OSINT | 0.5 – 1s | ChongLuaDao API latency |
| Collect HTML | 2 – 10s | Target server response time |
| Collect WHOIS/DNS | 1 – 5s | DNS/WHOIS server |
| Feature Extraction | < 0.1s | In-memory, không I/O |
| AI Summary | < 1ms | In-memory |
| Gemini AI | 5 – 15s | Model inference + network |
| **Tổng (fast path)** | **~1s** | OSINT có kết quả |
| **Tổng (full path)** | **~15–30s** | Phụ thuộc network |
