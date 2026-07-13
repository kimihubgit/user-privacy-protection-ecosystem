"""
Summary Builder

Chuyển đổi dữ liệu Collector + Feature + WHOIS + Network
thành dict tóm tắt để gửi cho LLM.
"""

from __future__ import annotations

from app.domain.entities.collector import CollectorResult
from app.domain.entities.feature_result import FeatureResult


class AISummaryBuilder:
    def build(
        self,
        collector: CollectorResult,
        feature: FeatureResult,
        whois: dict,
        network: dict,
    ) -> dict:
        return {
            # Website
            "domain": collector.domain,
            "title": collector.title,
            "final_url": collector.final_url,
            # Brand
            "detected_brand": feature.detected_brand,
            "brand_impersonation": feature.brand_impersonation,
            "brand_score": feature.brand_score,
            # Category
            "predicted_category": feature.predicted_category,
            "predicted_confidence": feature.predicted_confidence,
            # Form
            "has_login_form": feature.has_login_form,
            "password_inputs": feature.password_inputs,
            "email_inputs": feature.email_inputs,
            "otp_inputs": feature.otp_inputs,
            "hidden_inputs": feature.hidden_inputs,
            "external_form_action": feature.external_form_action,
            # HTML
            "iframe_count": feature.iframe_count,
            "script_count": feature.script_count,
            "hidden_elements": feature.hidden_elements,
            "form_count": feature.form_count,
            "image_count": feature.image_count,
            "link_count": feature.link_count,
            "word_count": feature.word_count,
            # URL
            "suspicious_url": feature.suspicious_url,
            # Keywords
            "bank_keywords": feature.bank_keywords,
            "crypto_keywords": feature.crypto_keywords,
            "gambling_keywords": feature.gambling_keywords,
            "phishing_keywords": feature.phishing_keywords,
            "malware_keywords": feature.malware_keywords,
            "payment_keywords": feature.payment_keywords,
            "suspicious_keywords": feature.suspicious_keywords,
            # Scores
            "url_score": feature.url_score,
            "keyword_score": feature.keyword_score,
            "html_score": feature.html_score,
            "content_score": feature.content_score,
            # WHOIS
            "domain_age_days": whois.get("domain_age_days"),
            "registrar": whois.get("registrar"),
            # Network
            "asn": network.get("asn"),
            "organization": network.get("organization"),
        }
