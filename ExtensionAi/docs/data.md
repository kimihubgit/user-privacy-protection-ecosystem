# Dữ liệu Brands & Keywords

## Tổng quan

Toàn bộ dữ liệu tĩnh nằm trong thư mục `data/`.  
**Quy tắc bắt buộc:** Không chứa logic, function, hay class (ngoại trừ Enum).  
Chỉ có `list`, `dict`, `set`, `tuple` và constants.

---

## Cấu trúc `data/brands/`

### Schema một Brand Entry

```python
{
    "display_name": "Vietcombank",          # Tên hiển thị canonical
    "domains": ["vietcombank.com.vn"],      # Domain chính thức (không có scheme)
    "aliases": ["vietcombank", "vcb", "vcbdigibank"],  # Từ khóa để tìm kiếm
    "category": "banking",                  # Nhóm ngành
    "risk_profile": "critical",             # Mức độ hấp dẫn với attacker
}
```

### `risk_profile` — Ý nghĩa

| Giá trị | Ý nghĩa |
|---|---|
| `critical` | Ngân hàng lớn, thương hiệu quốc tế — mục tiêu số 1 của phishing |
| `high` | Ngân hàng khu vực, cổng thanh toán phổ biến |
| `medium` | Thương hiệu được biết đến nhưng ít bị nhắm tới hơn |
| `low` | Ít xuất hiện trong phishing |

> **Lưu ý:** `risk_profile` đánh giá mức độ **attacker muốn giả mạo** brand đó,  
> **không phải** brand đó có nguy hiểm.

---

## Danh sách file brands

| File | Số lượng | Brands tiêu biểu |
|---|---|---|
| `banking.py` | 17 | Vietcombank, BIDV, MB Bank, Techcombank, HSBC, Citibank, JPMorgan Chase |
| `technology.py` | — | Google, Microsoft, Apple, Amazon, Meta |
| `social.py` | — | Facebook, Instagram, TikTok, YouTube, Zalo |
| `payment.py` | — | PayPal, Stripe, MoMo, ZaloPay, VNPay |
| `ecommerce.py` | — | Shopee, Lazada, Tiki, Amazon |
| `crypto.py` | — | Binance, Coinbase, OKX |
| `government.py` | — | Cổng dịch vụ công VN, Bộ Công an |
| `education.py` | — | Đại học Quốc gia, HUST, UEH |

### Tổng hợp qua `ALL_BRANDS`

```python
from data.brands import ALL_BRANDS  # Toàn bộ brands từ tất cả file
```

---

## Cách BrandDetector sử dụng data

Khi khởi động, `BrandDetector` build **alias index** một lần:

```python
# alias_lower → {display_name, domains, risk_profile}
_ALIAS_INDEX = {
    "vietcombank": {"display_name": "Vietcombank", "domains": ["vietcombank.com.vn"], ...},
    "vcb":         {"display_name": "Vietcombank", "domains": ["vietcombank.com.vn"], ...},
    "vcbdigibank": {"display_name": "Vietcombank", "domains": ["vietcombank.com.vn"], ...},
    "google":      {"display_name": "Google",       "domains": ["google.com"], ...},
    # ... toàn bộ alias của 60+ brands
}
```

Khi phân tích, chỉ cần O(n) string search qua index — không rebuild mỗi request.

---

## Thêm Brand mới

1. Tìm file phù hợp trong `data/brands/` (hoặc tạo file mới)
2. Thêm entry theo đúng schema:

```python
# data/brands/banking.py
BANKING_BRANDS = [
    # ... brands hiện có ...
    {
        "display_name": "OCB",
        "domains": ["ocb.com.vn"],
        "aliases": ["ocb", "orient commercial bank"],
        "category": "banking",
        "risk_profile": "high",
    },
]
```

3. Restart server để rebuild index

> **Không cần sửa code detector** khi thêm brand mới.

---

## Cấu trúc `data/keywords/`

Keywords được nhóm theo loại mối đe dọa và dùng bởi `KeywordDetector`.

| Nhóm | Ví dụ từ khóa |
|---|---|
| `BANK_KEYWORDS` | `otp`, `internet banking`, `ngân hàng`, `xác minh`, `chuyển khoản` |
| `GAMBLING_KEYWORDS` | `casino`, `bet`, `cá cược`, `cá độ`, `baccarat`, `lô đề` |
| `CRYPTO_KEYWORDS` | `crypto`, `bitcoin`, `wallet`, `airdrop`, `web3` |
| `PHISHING_KEYWORDS` | *(định nghĩa trong constants.py)* |
| `MALWARE_KEYWORDS` | *(định nghĩa trong constants.py)* |
| `PAYMENT_KEYWORDS` | *(định nghĩa trong constants.py)* |

---

## Thêm từ khóa mới

Mở file `app/usecases/feature_extraction/constants.py` và thêm vào set tương ứng:

```python
BANK_KEYWORDS = {
    "otp",
    "internet banking",
    # ... thêm từ khóa mới ở đây
    "ebanking",
}
```

Không cần restart server nếu dùng reload mode (`--reload`).
