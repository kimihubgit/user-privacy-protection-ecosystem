"""
Payment / checkout / invoice fraud lure keywords.
Schema documented in app.data.keywords.__init__.
"""

PAYMENT_KEYWORDS = [
    {"keyword": "confirm-payment-details", "category": "payment", "severity": "high"},
    {"keyword": "update-card-details", "category": "payment", "severity": "high"},
    {"keyword": "payment-failed", "category": "payment", "severity": "medium"},
    {"keyword": "refund-pending", "category": "payment", "severity": "medium"},
    {"keyword": "invoice-overdue", "category": "payment", "severity": "medium"},
    {"keyword": "billing-issue", "category": "payment", "severity": "medium"},
    {"keyword": "gift-card-redeem", "category": "payment", "severity": "medium"},
    {"keyword": "cashback-claim", "category": "payment", "severity": "low"},
    {"keyword": "hoan-tien", "category": "payment", "severity": "medium"},
    {"keyword": "xac-nhan-thanh-toan", "category": "payment", "severity": "high"},
]
