"""
Feature Result Schema
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class FeatureResult(BaseModel):
    """
    Feature Extraction Result

    Chỉ chứa Feature.

    Không chứa kết luận.

    Không chứa Risk Score.
    """

    # =====================================================
    # Brand
    # =====================================================

    detected_brand: str | None = None

    brand_impersonation: bool = False

    # =====================================================
    # Login Form
    # =====================================================

    has_login_form: bool = False

    password_inputs: int = 0

    email_inputs: int = 0

    hidden_inputs: int = 0

    otp_inputs: int = 0

    external_form_action: bool = False

    # =====================================================
    # HTML
    # =====================================================

    iframe_count: int = 0

    script_count: int = 0

    hidden_elements: int = 0

    form_count: int = 0

    image_count: int = 0

    link_count: int = 0

    word_count: int = 0

    # =====================================================
    # URL
    # =====================================================

    suspicious_url: bool = False

    suspicious_keywords: list[str] = Field(default_factory=list)

    # =====================================================
    # Keywords
    # =====================================================

    bank_keywords: list[str] = Field(default_factory=list)

    gambling_keywords: list[str] = Field(default_factory=list)

    crypto_keywords: list[str] = Field(default_factory=list)

    phishing_keywords: list[str] = Field(default_factory=list)

    malware_keywords: list[str] = Field(default_factory=list)

    payment_keywords: list[str] = Field(default_factory=list)

    # =====================================================
    # Content Classification
    # =====================================================

    predicted_category: str = "Unknown"

    predicted_confidence: float = 0.0

    # =====================================================
    # Feature Score
    # =====================================================

    brand_score: int = 0

    url_score: int = 0

    keyword_score: int = 0

    html_score: int = 0

    content_score: int = 0
