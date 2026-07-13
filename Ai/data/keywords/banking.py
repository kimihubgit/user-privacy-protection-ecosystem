"""
Banking / financial fraud lure keywords.
Schema documented in app.data.keywords.__init__.
"""

BANKING_KEYWORDS = [
    {"keyword": "internet-banking", "category": "banking", "severity": "medium"},
    {"keyword": "online-banking-login", "category": "banking", "severity": "high"},
    {"keyword": "otp-verification", "category": "banking", "severity": "high"},
    {"keyword": "ma-otp", "category": "banking", "severity": "high"},
    {"keyword": "e-banking", "category": "banking", "severity": "medium"},
    {"keyword": "swift-transfer", "category": "banking", "severity": "medium"},
    {"keyword": "card-blocked", "category": "banking", "severity": "critical"},
    {"keyword": "the-bi-khoa", "category": "banking", "severity": "critical"},
    {"keyword": "cap-nhat-sinh-trac-hoc", "category": "banking", "severity": "high"},
    {"keyword": "xac-thuc-sinh-trac", "category": "banking", "severity": "high"},
    {"keyword": "update-kyc", "category": "banking", "severity": "high"},
    {"keyword": "loan-approval", "category": "banking", "severity": "medium"},
    {"keyword": "credit-limit-increase", "category": "banking", "severity": "medium"},
    {"keyword": "statement-download", "category": "banking", "severity": "low"},
    {"keyword": "wire-transfer-confirmation", "category": "banking", "severity": "medium"},
]
