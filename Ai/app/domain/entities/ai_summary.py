from pydantic import BaseModel


class AISummary(BaseModel):

    domain: str

    title: str

    detected_brand: str | None

    brand_impersonation: bool

    predicted_category: str

    predicted_confidence: float

    password_inputs: int

    email_inputs: int

    otp_inputs: int

    external_form_action: bool

    iframe_count: int

    script_count: int

    hidden_elements: int

    word_count: int

    url_score: int

    keyword_score: int

    html_score: int

    content_score: int

    brand_score: int

    bank_keywords: int

    crypto_keywords: int

    gambling_keywords: int

    payment_keywords: int

    phishing_keywords: int

    malware_keywords: int

    domain_age_days: int | None

    registrar: str | None

    asn: str | None

    organization: str | None