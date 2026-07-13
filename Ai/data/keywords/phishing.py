"""
Evidence Database
-----------------

Phishing Keyword Database

Knowledge Base dành cho Keyword Detector.

Nguyên tắc:
- Chỉ chứa dữ liệu
- Không chứa Rule
- Không chứa Risk Score
- Không chứa Confidence
- Không chứa Logic

Author: Anti Scam Detector
"""

from __future__ import annotations

PHISHING_KEYWORDS: dict[str, dict] = {

    "account": {
        "description": "Account",
        "keywords": [
            "account",
            "tai khoan",
            "tài khoản",
            "my account",
            "your account",
            "customer account",
            "member account"
        ]
    },

    "login": {
        "description": "Login",
        "keywords": [
            "login",
            "log in",
            "sign in",
            "signin",
            "dang nhap",
            "đăng nhập",
            "member login",
            "customer login"
        ]
    },

    "password": {
        "description": "Password",
        "keywords": [
            "password",
            "mat khau",
            "mật khẩu",
            "passcode",
            "pin",
            "security code"
        ]
    },

    "otp": {
        "description": "One Time Password",
        "keywords": [
            "otp",
            "one time password",
            "verification code",
            "authentication code",
            "sms code"
        ]
    },

    "verification": {
        "description": "Verification",
        "keywords": [
            "verify",
            "verification",
            "verified",
            "confirm",
            "confirmation",
            "validate",
            "authenticate",
            "identity verification",
            "account verification"
        ]
    },

    "security": {
        "description": "Security",
        "keywords": [
            "security",
            "secure",
            "protection",
            "protect",
            "safe login",
            "secure login",
            "security alert",
            "security center"
        ]
    },

    "urgent": {
        "description": "Urgent Message",
        "keywords": [
            "urgent",
            "immediately",
            "important",
            "attention",
            "warning",
            "alert",
            "critical",
            "action required",
            "limited time"
        ]
    },

    "suspension": {
        "description": "Account Suspension",
        "keywords": [
            "suspend",
            "suspended",
            "disabled",
            "blocked",
            "locked",
            "freeze",
            "restricted"
        ]
    },

    "recovery": {
        "description": "Account Recovery",
        "keywords": [
            "recover",
            "recovery",
            "restore",
            "reset password",
            "unlock account"
        ]
    },

    "payment": {
        "description": "Payment Request",
        "keywords": [
            "payment required",
            "pay now",
            "confirm payment",
            "billing",
            "invoice",
            "transaction failed"
        ]
    },

    "banking": {
        "description": "Online Banking",
        "keywords": [
            "internet banking",
            "mobile banking",
            "online banking"
        ]
    },

    "credential": {
        "description": "Credential Request",
        "keywords": [
            "username",
            "email address",
            "phone number",
            "credit card",
            "cvv",
            "expiration date"
        ]
    }

}

__all__ = [
    "PHISHING_KEYWORDS"
]