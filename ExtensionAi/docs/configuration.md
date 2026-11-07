# Cấu hình môi trường

## File `.env`

Tạo file `.env` ở thư mục gốc dự án:

```bash
# ============================================================
# App
# ============================================================
APP_NAME=Phishing Detector
APP_VERSION=1.0.0
DEBUG=true

# ============================================================
# Server
# ============================================================
HOST=0.0.0.0
PORT=8000

# ============================================================
# Google Gemini AI  (BẮT BUỘC)
# ============================================================
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

---

## Các biến môi trường

| Biến | Mặc định | Bắt buộc | Mô tả |
|---|---|---|---|
| `APP_NAME` | `Phishing Detector` | ❌ | Tên ứng dụng (hiển thị trong API docs) |
| `APP_VERSION` | `1.0.0` | ❌ | Phiên bản API |
| `DEBUG` | `true` | ❌ | Bật debug mode |
| `HOST` | `0.0.0.0` | ❌ | Host server lắng nghe |
| `PORT` | `8000` | ❌ | Port server |
| `GEMINI_API_KEY` | — | ✅ | API key Google Gemini |
| `GEMINI_MODEL` | `gemini-2.5-flash` | ❌ | Model Gemini sử dụng |

---

## Lấy Gemini API Key

1. Truy cập [Google AI Studio](https://aistudio.google.com/)
2. Đăng nhập tài khoản Google
3. Vào **Get API Key** → **Create API key**
4. Copy key và dán vào `GEMINI_API_KEY` trong file `.env`

---

## Chạy server

```bash
# Development (auto-reload khi thay đổi code)
PYTHONPATH=. uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production
PYTHONPATH=. uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Logging

Hệ thống dùng **Loguru** với format:

```
2026-07-12 15:30:00 | INFO | [Pipeline] Analyze: https://example.com
2026-07-12 15:30:01 | INFO | [Pipeline] OSINT: No result → starting collector
2026-07-12 15:30:05 | INFO | [Pipeline] Collected — domain=example.com age=365 asn=AS13335
2026-07-12 15:30:05 | INFO | [FeatureExtractor] done in 0.042s — brand=None category=Unknown
2026-07-12 15:30:20 | INFO | [AIAgent] status=safe score=10 confidence=0.95 categories=[]
2026-07-12 15:30:20 | INFO | [Pipeline] Done — status=safe score=10 confidence=0.95
```

Log level mặc định: `INFO`. Thay đổi trong `app/config/logger.py`.

---

## Lưu ý Windows

Trên Windows, biến `NO_PROXY` có thể chứa `::1` (IPv6 loopback) gây lỗi parse.  
`settings.py` đã tự động xử lý vấn đề này khi khởi động.

Luôn set encoding khi chạy trực tiếp:

```powershell
$env:PYTHONIOENCODING="utf-8"
$env:PYTHONPATH="."
python tests/test_checker.py
```
