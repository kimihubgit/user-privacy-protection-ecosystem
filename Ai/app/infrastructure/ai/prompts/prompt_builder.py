"""
Prompt Builder

Xây dựng prompt tối ưu để gửi cho Gemini.
"""

from __future__ import annotations

_ALLOWED_CATEGORIES = ", ".join(
    [
        "Business",
        "Government",
        "Education",
        "News",
        "Forum",
        "Blog",
        "Social",
        "Shopping",
        "E-commerce",
        "Finance",
        "Banking",
        "Payment",
        "Insurance",
        "Healthcare",
        "Travel",
        "Logistics",
        "Cloud",
        "Software",
        "Hosting",
        "Technology",
        "Download",
        "APK",
        "Gaming",
        "Casino",
        "Sports Betting",
        "Gambling",
        "Lottery",
        "Crypto",
        "Investment",
        "Forex",
        "Adult",
        "Malware",
        "Unknown",
    ]
)

_ALLOWED_INDICATORS = ", ".join(
    [
        "Phishing",
        "Scam",
        "Credential Harvesting",
        "Fake Login",
        "Fake Payment",
        "Fake Banking",
        "Brand Impersonation",
        "Password Collection",
        "OTP Collection",
        "Email Collection",
        "Casino",
        "Sports Betting",
        "Lottery",
        "Gambling",
        "Crypto Scam",
        "Investment Scam",
        "Forex Scam",
        "APK Distribution",
        "Malware",
    ]
)

_OUTPUT_FORMAT = """{
    "analysis_type": "LLM",
    "risk_score": 0,
    "status": "safe",
    "level": "Low",
    "confidence": 0.95,
    "categories": [],
    "indicators": [],
    "reason": []
}"""


class PromptBuilder:
    def build(self, summary: dict) -> str:
        g = summary.get  # shorthand

        return f"""\
Bạn là chuyên gia Threat Intelligence và Phishing Detection.
Website này KHÔNG có trong ChongLuaDao. Đánh giá CHỈ dựa trên dữ liệu sau.

=== WEBSITE ===
Domain          : {g("domain")}
Title           : {g("title")}
Brand           : {g("detected_brand")}
Brand Fake      : {g("brand_impersonation")}
Category        : {g("predicted_category")} ({g("predicted_confidence")})
Domain Age      : {g("domain_age_days")} ngày
Registrar       : {g("registrar")}
ASN             : {g("asn")}
Organization    : {g("organization")}

=== FORM ===
Login Form      : {g("has_login_form")}
Password Inputs : {g("password_inputs")}
Email Inputs    : {g("email_inputs")}
OTP Inputs      : {g("otp_inputs")}
Hidden Inputs   : {g("hidden_inputs")}
External Form   : {g("external_form_action")}

=== HTML ===
Iframes         : {g("iframe_count")}
Scripts         : {g("script_count")}
Hidden Elements : {g("hidden_elements")}
Forms           : {g("form_count")}
Images          : {g("image_count")}
Links           : {g("link_count")}
Words           : {g("word_count")}

=== KEYWORDS ===
Bank            : {g("bank_keywords")}
Crypto          : {g("crypto_keywords")}
Gambling        : {g("gambling_keywords")}
Payment         : {g("payment_keywords")}
Phishing        : {g("phishing_keywords")}
Malware         : {g("malware_keywords")}
Suspicious      : {g("suspicious_keywords")}

=== SCORES ===
Brand   : {g("brand_score")}
URL     : {g("url_score")}
Keyword : {g("keyword_score")}
HTML    : {g("html_score")}
Content : {g("content_score")}

=== QUY TẮC ===
- Không suy đoán nếu thiếu bằng chứng — giảm confidence.
- Risk Score: 0–20 = safe | 21–60 = malicious (Medium) | 61–100 = malicious (High)
- Chỉ chọn category trong: {_ALLOWED_CATEGORIES}
- Chỉ chọn indicator trong: {_ALLOWED_INDICATORS}
- reason: MỘT CÂU DUY NHẤT, tối đa 30 từ, tiếng Việt, học thuật.

=== OUTPUT ===
Chỉ trả về JSON thuần. Không markdown. Không giải thích.

{_OUTPUT_FORMAT}"""
