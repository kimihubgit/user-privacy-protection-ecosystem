"""
Generic phishing / social-engineering lure keywords (URL paths, subject
lines, page titles). Schema documented in app.data.keywords.__init__.
"""

PHISHING_KEYWORDS = [
    {"keyword": "verify-account", "category": "phishing", "severity": "high"},
    {"keyword": "verify your account", "category": "phishing", "severity": "high"},
    {"keyword": "confirm-identity", "category": "phishing", "severity": "high"},
    {"keyword": "account-suspended", "category": "phishing", "severity": "critical"},
    {"keyword": "account-locked", "category": "phishing", "severity": "critical"},
    {"keyword": "unusual-activity", "category": "phishing", "severity": "high"},
    {"keyword": "security-alert", "category": "phishing", "severity": "high"},
    {"keyword": "update-billing", "category": "phishing", "severity": "medium"},
    {"keyword": "update-payment", "category": "phishing", "severity": "medium"},
    {"keyword": "login-required", "category": "phishing", "severity": "medium"},
    {"keyword": "signin-verify", "category": "phishing", "severity": "high"},
    {"keyword": "password-expired", "category": "phishing", "severity": "medium"},
    {"keyword": "reset-password", "category": "phishing", "severity": "medium"},
    {"keyword": "click-here-now", "category": "phishing", "severity": "medium"},
    {"keyword": "urgent-action-required", "category": "phishing", "severity": "high"},
    {"keyword": "limited-time-offer", "category": "phishing", "severity": "low"},
    {"keyword": "your-package-is-on-hold", "category": "phishing", "severity": "medium"},
    {"keyword": "delivery-failed", "category": "phishing", "severity": "medium"},
    {"keyword": "invoice-attached", "category": "phishing", "severity": "medium"},
    {"keyword": "tai-khoan-bi-khoa", "category": "phishing", "severity": "critical"},
    {"keyword": "xac-minh-tai-khoan", "category": "phishing", "severity": "high"},
    {"keyword": "canh-bao-bao-mat", "category": "phishing", "severity": "high"},
    {"keyword": "cap-nhat-thong-tin", "category": "phishing", "severity": "medium"},
    {"keyword": "khoa-tai-khoan", "category": "phishing", "severity": "critical"},
]
