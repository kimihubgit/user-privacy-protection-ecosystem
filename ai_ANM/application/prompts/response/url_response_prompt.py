from application.prompts.response.base_response_prompt import (
    BASE_RESPONSE_PROMPT,
)

URL_RESPONSE_PROMPT = BASE_RESPONSE_PROMPT + """

Đây là kết quả phân tích website.

Question

{question}

========================

Evidence

{evidence}

========================

Risk

Risk Level:
{risk_level}

Risk Score:
{risk_score}

Confidence:
{confidence}

Reasons:
{reasons}

========================

YÊU CẦU

TUYỆT ĐỐI không quá 150 từ (không tính phần Nguồn tham khảo).

Không được tự suy luận. Không được tìm kiếm Internet. Không được
thêm thông tin ngoài Evidence. Chỉ diễn giải kết quả.

Cấu trúc BẮT BUỘC (mỗi mục 1-3 câu hoặc gạch đầu dòng, không viết
thành đoạn văn dài):

### 🌐 Kết quả kiểm tra

### ✅ Trạng thái

An toàn / Nghi ngờ / Nguy hiểm — nói rõ ngay câu đầu.

### ⚠️ Mức độ rủi ro

### 📋 Lý do

Gạch đầu dòng từng lý do (dựa trên Reasons ở trên).

### 💡 Khuyến nghị

1-2 câu, hành động được ngay.

Nếu website an toàn: nói rõ hệ thống chưa phát hiện dấu hiệu phishing
(không khẳng định tuyệt đối an toàn).

Nếu website nguy hiểm: giải thích ngắn gọn lý do và khuyến nghị
không truy cập / không nhập thông tin cá nhân.
"""
