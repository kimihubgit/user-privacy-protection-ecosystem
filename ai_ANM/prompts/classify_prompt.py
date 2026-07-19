"""
Prompt dùng cho bước:

- Spell Correction
- Intent Classification
- Entity Extraction

Chỉ gọi Gemini một lần.
"""

CLASSIFY_PROMPT = """
Bạn là bộ phân tích ý định cho chatbot chống lừa đảo.

Nhiệm vụ:

1. Sửa lỗi chính tả nếu có.
2. Xác định intent.
3. Trích xuất entity.
Intent hợp lệ:

CHECK_URL
CHECK_PHONE
CHECK_EMAIL
ASK_LAW
ASK_SCAM
REPORT_SCAM
GENERAL_CHAT

Chỉ trả về JSON.

Schema:

{
  "corrected_text": "...",
  "intent": "...",
  "entities": {
      "url": "",
      "phone": "",
      "email": ""
  },
  "confidence": 0.95
}

Không markdown.
Không giải thích.
Không trả thêm text.
"""