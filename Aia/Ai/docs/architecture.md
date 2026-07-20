# Kiến trúc hệ thống

## Tổng quan

Hệ thống được thiết kế theo **Clean Architecture** (kiến trúc phân tầng) với nguyên tắc:

- **Dependency Rule**: Tầng trong không phụ thuộc tầng ngoài
- **Separation of Concerns**: Mỗi module chỉ làm đúng một việc
- **Testability**: Logic nghiệp vụ độc lập với framework và DB

---

## Cấu trúc thư mục

```
Ai/
├── main.py                         # Entrypoint FastAPI
├── .env                            # Biến môi trường (không commit)
├── requirements.txt
│
├── app/                            # Application code
│   ├── config/                     # Cấu hình toàn cục
│   │   ├── settings.py             # Đọc .env, expose constants
│   │   └── logger.py               # Cấu hình Loguru
│   │
│   ├── domain/                     # TẦng 1 — Domain (core)
│   │   └── entities/
│   │       ├── collector.py        # CollectorResult — dữ liệu thu thập được
│   │       ├── feature_result.py   # FeatureResult — 40+ đặc trưng
│   │       ├── check_result.py     # CheckResult — kết quả từng check
│   │       └── ai_summary.py       # AISummary — schema tóm tắt cho AI
│   │
│   ├── usecases/                   # TẦng 2 — Use Cases (nghiệp vụ)
│   │   ├── analyzer/
│   │   │   ├── pipeline.py         # AnalyzerService — điều phối pipeline
│   │   │   ├── osint_agent.py      # OSINT lookup (ChongLuaDao)
│   │   │   ├── collector_agent.py  # Thu thập HTML/DNS/WHOIS/Network
│   │   │   └── ai_analysis_agent.py # Gọi AI pipeline
│   │   ├── feature_extraction/
│   │   │   ├── extractor.py        # FeatureExtractor — orchestrator
│   │   │   ├── constants.py        # Keyword constants
│   │   │   └── detectors/
│   │   │       ├── brand_detector.py    # Phát hiện brand giả mạo
│   │   │       ├── form_detector.py     # Phân tích form HTML
│   │   │       ├── keyword_detector.py  # Tìm từ khóa nguy hiểm
│   │   │       ├── url_detector.py      # URL suspicious check
│   │   │       └── html_detector.py     # Cấu trúc HTML
│   │   └── summary/
│   │       └── summary_builder.py  # Gom data → dict gửi AI
│   │
│   ├── infrastructure/             # TẦng 3 — Infrastructure (I/O)
│   │   ├── collectors/
│   │   │   ├── html_collector.py   # Download & parse HTML
│   │   │   ├── dns_resolver.py     # DNS lookup
│   │   │   ├── whois_collector.py  # WHOIS query
│   │   │   └── network_collector.py# IP → ASN, organization
│   │   ├── osint/
│   │   │   └── providers/
│   │   │       ├── base_provider.py
│   │   │       └── chongluadao_provider.py # ChongLuaDao API
│   │   └── ai/
│   │       ├── llm_analyzer.py     # Gemini API client
│   │       ├── prompts/
│   │       │   └── prompt_builder.py # Xây dựng prompt cấu trúc
│   │       └── parsers/
│   │           ├── json_parser.py      # Parse JSON từ LLM
│   │           └── response_validator.py # Validate & normalize
│   │
│   └── presentation/               # TẦng 4 — Presentation (API)
│       └── api/
│           ├── router.py           # Gộp tất cả routers
│           ├── analyze.py          # POST /api/v1/analyze
│           ├── health.py           # GET  /api/v1/health
│           └── schemas/
│               ├── analyze_request.py
│               └── analyze_response.py
│
├── data/                           # Dữ liệu tĩnh (không có logic)
│   ├── brands/                     # Brand reference data
│   │   ├── banking.py              # 17 ngân hàng VN + quốc tế
│   │   ├── technology.py           # Tech giants (Google, Microsoft...)
│   │   ├── social.py               # Mạng xã hội (Facebook, Instagram...)
│   │   ├── payment.py              # Cổng thanh toán
│   │   ├── ecommerce.py            # Thương mại điện tử
│   │   ├── crypto.py               # Sàn crypto
│   │   ├── government.py           # Cơ quan chính phủ VN
│   │   └── education.py            # Trường đại học, tổ chức giáo dục
│   └── keywords/                   # Từ khóa phát hiện theo nhóm
│
└── tests/
    └── test_checker.py             # End-to-end test
```

---

## Phân tầng chi tiết

### Tầng 1 — Domain Entities

Các **Pydantic model** thuần túy, không có logic nghiệp vụ.  
Là ngôn ngữ chung (ubiquitous language) của toàn hệ thống.

| Entity | Mô tả |
|---|---|
| `CollectorResult` | Toàn bộ dữ liệu thu thập được từ một URL |
| `FeatureResult` | 40+ đặc trưng được trích xuất (score, count, flag) |
| `CheckResult` | Kết quả của một check cụ thể (score, passed, reasons) |

### Tầng 2 — Use Cases

Chứa **logic nghiệp vụ** thuần túy. Không import framework (FastAPI, requests).

| Class | Trách nhiệm |
|---|---|
| `AnalyzerService` | Điều phối toàn bộ pipeline |
| `OSINTAgent` | Normalize URL, gọi OSINT provider |
| `CollectorAgent` | Gọi song song 4 collectors |
| `AIAnalysisAgent` | Điều phối pipeline AI |
| `FeatureExtractor` | Chạy 5 detectors tuần tự |
| `AISummaryBuilder` | Gom data thành dict gửi AI |

### Tầng 3 — Infrastructure

Chứa tất cả **I/O**: HTTP, DNS, file, API ngoài.  
Implement interface được định nghĩa ở tầng Use Cases.

| Module | External System |
|---|---|
| `HTMLCollector` | HTTP (requests) |
| `DNSResolver` | DNS |
| `WHOISCollector` | WHOIS protocol |
| `NetworkCollector` | IP geolocation / ASN |
| `ChongLuaDaoProvider` | ChongLuaDao REST API |
| `LLMAnalyzer` | Google Gemini API |

### Tầng 4 — Presentation

FastAPI routers và Pydantic schemas cho input/output.  
Không chứa logic nghiệp vụ. Chỉ validate, delegate và format response.

---

## Nguyên tắc thiết kế quan trọng

### 1. Single Responsibility
Mỗi class chỉ có **một lý do để thay đổi**:
- `BrandDetector` chỉ detect brand, không score
- `PromptBuilder` chỉ build prompt, không gọi API
- `LLMParser` chỉ parse JSON, không validate

### 2. Fail Safe với Early Return
Pipeline dừng sớm khi có đủ thông tin:
```
OSINT = safe      → return ngay (score=0)
OSINT = malicious → return ngay (score=100)
AI lỗi            → fallback result (score=50)
```

### 3. Immutable Data Flow
Data chỉ đi **một chiều** qua pipeline:
```
URL → CollectorResult → FeatureResult → SummaryDict → AnalysisDict
```
Không có mutation ngược lại.
