"""
Prompt Builder V5

Input:
    CollectorResult
    EvidenceResult

Output:
    Prompt

Không chứa:
- Rule
- Risk
- Score
- Judgment

Tối ưu so với V4:
- Bỏ field "summary" trùng lặp với "reason" (2 field cùng tóm tắt 1 việc)
- "reason" rút từ đoạn văn 40-80 từ -> một câu <=25 từ
- "indicators" từ mảng object (indicator+reason+severity) -> mảng string
  (severity/reason chi tiết đã nằm trong câu "reason" chính, không cần
  lặp lại cho từng indicator)
- Gộp rule về "reason" về đúng 1 chỗ (_output), bỏ lặp ở _system
=> Output token giảm mạnh (đây là phần quyết định tốc độ phản hồi,
   vì sinh token là tuần tự và chậm hơn nhiều so với đọc input).

Author: Anti Scam Detector
"""

from __future__ import annotations

from app.domain.entities.collector import CollectorResult
from app.presentation.api.schemas.evidence_result import EvidenceResult

class PromptBuilder:

    """
    Prompt Builder
    """

    def build(
        self,
        collector: CollectorResult,
        evidences: EvidenceResult
    ) -> str:

        prompt = []

        prompt.append(self._system())

        prompt.append(
            self._website(
                collector
            )
        )

        prompt.append(
            self._evidence(
                evidences
            )
        )

        prompt.append(
            self._output()
        )

        return "\n\n".join(prompt)

    #
    # SYSTEM
    #

    def _system(self):

        return """
You are an expert cybersecurity analyst.

The observations below are automatically collected from a website.
They are factual observations only, NOT conclusions.

Classify the website as: safe | suspicious | malicious.

Evaluate ALL observations together. Never conclude malicious from a
single observation alone (e.g. login form, password field, OTP field,
Cloudflare, GitHub Pages, new domain, brand keyword) — these are common
on legitimate sites too. Only classify malicious when multiple
independent observations consistently point to malicious intent. If
evidence is incomplete or conflicting, classify as suspicious. Never
invent or infer evidence that is not provided.

Examples

Safe: Website chia sẻ kiến thức lập trình, tên miền hoạt động ổn định,
không có dấu hiệu bất thường.

Suspicious: Website tài chính yêu cầu đăng nhập, tên miền còn mới, cần
kiểm tra kỹ trước khi dùng.

Malicious: Website yêu cầu tài khoản, mật khẩu, OTP và dùng tên thương
hiệu nhưng địa chỉ không tương ứng, không nên tiếp tục sử dụng.
"""

    #
    # WEBSITE
    #

    def _website(
        self,
        collector
    ):

        return f"""
Website

URL:
{collector.final_url}

Title:
{collector.title}
"""

    #
    # EVIDENCE
    #

    def _evidence(
        self,
        evidences
    ):

        lines = [
            "Observed Evidence"
        ]

        for group in evidences:

            lines.append(
                f"\n[{group.detector}]"
            )

            for evidence in group:

                lines.append(
                    f"- {evidence.type}"
                    f" | {evidence.name}"
                    f" | {evidence.value}"
                    f" | {evidence.location}"
                )

                if evidence.context:

                    lines.append(
                        f"  Context: {evidence.context}"
                    )

        return "\n".join(lines)

    #
    # OUTPUT
    #

    def _output(self):

        return """
Return ONLY valid JSON, no markdown, no explanation outside JSON.

{
    "analysis_type":"LLM",

    "risk_score":0,

    "status":"safe | suspicious | malicious",

    "level":"Low | Medium | High",

    "confidence":0.0,

    "categories":[
        "..."
    ],

    "indicators":[
        "..."
    ],

    "reason":[
        "..."
    ]
}

Requirements

risk_score: 0-20 = safe, 21-60 = suspicious, 61-100 = malicious.

confidence: 0.0-1.0, phản ánh mức độ evidence hỗ trợ kết luận (evidence
mỏng/mâu thuẫn -> confidence thấp).

categories: chỉ chọn category phù hợp nhất, ví dụ:
["banking"] ["gambling"] ["crypto"] ["news"] ["education"] ["blog"]
["government"] ["shopping"] ["social"] ["unknown"]

indicators: mảng các cụm từ ngắn bằng tiếng Việt (2-5 từ mỗi cụm), mỗi
cụm nêu MỘT dấu hiệu quan sát được, không giải thích thêm. Tối đa 5 mục.
Ví dụ: ["Yêu cầu đăng nhập", "Tên miền mới", "Không khớp thương hiệu"]

reason: MỘT câu duy nhất trong mảng, tiếng Việt, tối đa 25 từ, ngôn ngữ
đơn giản cho người dùng phổ thông (tránh thuật ngữ bảo mật, không nhắc
đến AI/confidence/xác suất/phân tích nội bộ). Câu phải nêu: website về
gì + dấu hiệu quan trọng nhất + kết luận ngắn gọn. Không lặp lại nội
dung đã có trong indicators dưới dạng câu văn.
"""