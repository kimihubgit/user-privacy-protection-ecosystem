# Phishing Detector AI — Tài liệu hệ thống

> **Phiên bản:** 1.0.0  
> **Cập nhật:** 2026-07-12  
> **Ngôn ngữ:** Python 3.11+ / FastAPI / Gemini 2.5 Flash

---

## Mục lục tài liệu

| Tài liệu | Mô tả |
|---|---|
| [architecture.md](./architecture.md) | Kiến trúc hệ thống (Clean Architecture) |
| [pipeline.md](./pipeline.md) | Luồng xử lý chi tiết từng bước |
| [api.md](./api.md) | Tài liệu API endpoint |
| [data.md](./data.md) | Cấu trúc dữ liệu brands & keywords |
| [configuration.md](./configuration.md) | Cấu hình môi trường |

---

## Tổng quan

**Phishing Detector AI** là hệ thống phân tích URL để phát hiện website lừa đảo, giả mạo và độc hại.
Hệ thống kết hợp ba nguồn dữ liệu:

1. **OSINT (ChongLuaDao)** — tra cứu danh sách đen/trắng cộng đồng
2. **Feature Extraction** — phân tích HTML, form, brand, từ khóa
3. **AI Analysis (Gemini)** — đánh giá tổng hợp bằng LLM

---

## Khởi động nhanh

```bash
# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env
cp .env.example .env
# Điền GEMINI_API_KEY vào .env

# Chạy server
uvicorn main:app --reload --port 8000
```

Sau khi khởi động, truy cập:
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/api/v1/health
