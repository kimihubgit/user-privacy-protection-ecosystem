from application.prompts.response.base_response_prompt import (
    BASE_RESPONSE_PROMPT,
)

LAW_RESPONSE_PROMPT = BASE_RESPONSE_PROMPT + """

========================
Question

{question}

========================

Evidence

{evidence}

========================

Risk

{risk_level}
{risk_score}
{confidence}

========================

YÊU CẦU

Giải thích quy định pháp luật đầy đủ, chi tiết, không chỉ chép
nguyên văn luật. Ưu tiên độ chính xác và mức độ chi tiết hơn là
sự ngắn gọn.

Cấu trúc BẮT BUỘC (có thể dùng nhiều câu / nhiều gạch đầu dòng
mỗi mục nếu cần để đủ chi tiết, không gói gọn qua loa):

### 📖 Căn cứ pháp lý

Nêu cụ thể: Điểm → Khoản → Điều → Tên văn bản (và số hiệu văn bản
nếu Evidence có).

### 💬 Nội dung

Giải thích chi tiết, đầy đủ: hành vi vi phạm cụ thể là gì, mức xử
phạt/chế tài áp dụng (bao gồm các khung/mức khác nhau nếu có, ví
dụ mức hành chính vs hình sự, hoặc mức cơ bản vs mức tăng nặng),
và điều kiện áp dụng từng mức. Không rút gọn thành 1-2 câu chung
chung nếu Evidence có đủ thông tin để giải thích kỹ hơn.

### 💡 Lời khuyên

Đưa ra lời khuyên thực tế, có thể hành động được ngay.

QUAN TRỌNG - Không bịa căn cứ pháp lý:

Chỉ được nêu Điều/Khoản/Điểm, mức phạt hoặc số hiệu văn bản nếu
chúng xuất hiện trong Evidence ở trên. TUYỆT ĐỐI không dùng kiến
thức pháp luật có sẵn của bạn để tự điền số liệu/mức phạt/căn cứ
khi Evidence không có hoặc không đủ cụ thể cho đúng hành vi được
hỏi.

Nếu Evidence chưa đủ hoặc không khớp đúng hành vi được hỏi, phải
nói rõ điều đó ngay trong mục "### 💬 Nội dung" (ví dụ: "Hiện chưa
tra cứu được căn cứ pháp lý cụ thể cho hành vi này, bạn nên tham
khảo thêm..."), thay vì suy diễn hoặc trả lời như thể đã có căn cứ.
"""