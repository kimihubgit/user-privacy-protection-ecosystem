import re


def extract_json(text: str) -> str:
    """
    Trích phần JSON thuần từ text trả về của LLM.

    Gemini (và hầu hết LLM khác) thường bọc JSON trong markdown code fence
    (```json ... ``` hoặc ``` ... ```) dù prompt đã yêu cầu "chỉ trả JSON".
    Nếu không xử lý, json.loads() sẽ luôn ném lỗi ở những trường hợp này,
    khiến các parser rơi vào nhánh fallback "an toàn" (need_retry=True,
    tools=[], risk=UNKNOWN...) một cách SAI, không phản ánh đúng nội dung
    LLM thực sự trả về.
    """

    text = text.strip()

    # Trường hợp có code fence -> lấy phần bên trong
    fence_match = re.search(
        r"```(?:json)?\s*(.*?)\s*```",
        text,
        re.DOTALL,
    )

    if fence_match:
        return fence_match.group(1).strip()

    # Không có fence nhưng có thể LLM thêm lời dẫn trước/sau khối JSON
    # -> cắt từ dấu { đầu tiên tới dấu } cuối cùng.
    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1 and end > start:
        return text[start:end + 1]

    return text
