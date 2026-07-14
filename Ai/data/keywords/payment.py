"""
Evidence Database
-----------------

Payment Keyword Database

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

PAYMENT_KEYWORDS: dict[str, dict] = {

    # ==========================================================
    # Payment
    # ==========================================================

    "payment": {

        "description": "Payment",

        "keywords": [

            "payment",
            "pay",
            "pay now",
            "make payment",
            "online payment",
            "thanh toán",
            "thanh toan"

        ]

    },

    # ==========================================================
    # Invoice
    # ==========================================================

    "invoice": {

        "description": "Invoice",

        "keywords": [

            "invoice",
            "bill",
            "billing",
            "receipt",
            "electronic invoice",
            "hóa đơn",
            "hoa don"

        ]

    },

    # ==========================================================
    # Checkout
    # ==========================================================

    "checkout": {

        "description": "Checkout",

        "keywords": [

            "checkout",
            "place order",
            "buy now",
            "purchase",
            "order confirmation"

        ]

    },

    # ==========================================================
    # Refund
    # ==========================================================

    "refund": {

        "description": "Refund",

        "keywords": [

            "refund",
            "money back",
            "return payment",
            "refund request",
            "hoàn tiền"

        ]

    },

    # ==========================================================
    # Wallet
    # ==========================================================

    "wallet": {

        "description": "Digital Wallet",

        "keywords": [

            "wallet",
            "e-wallet",
            "electronic wallet",
            "ví điện tử",
            "vi dien tu"

        ]

    },

    # ==========================================================
    # QR Payment
    # ==========================================================

    "qr_payment": {

        "description": "QR Payment",

        "keywords": [

            "qr payment",
            "qr code",
            "scan qr",
            "vietqr",
            "qr transfer"

        ]

    },

    # ==========================================================
    # Transfer
    # ==========================================================

    "transfer": {

        "description": "Money Transfer",

        "keywords": [

            "transfer",
            "bank transfer",
            "wire transfer",
            "money transfer",
            "chuyển khoản",
            "chuyen khoan"

        ]

    },

    # ==========================================================
    # Card
    # ==========================================================

    "card": {

        "description": "Payment Card",

        "keywords": [

            "credit card",
            "debit card",
            "visa",
            "mastercard",
            "american express",
            "amex"

        ]

    },

    # ==========================================================
    # Payment Method
    # ==========================================================

    "payment_method": {

        "description": "Payment Method",

        "keywords": [

            "payment method",
            "payment option",
            "choose payment",
            "cash on delivery",
            "cod"

        ]

    },

    # ==========================================================
    # Subscription
    # ==========================================================

    "subscription": {

        "description": "Subscription",

        "keywords": [

            "subscription",
            "monthly payment",
            "yearly payment",
            "renew subscription",
            "auto renewal"

        ]

    },

    # ==========================================================
    # Donation
    # ==========================================================

    "donation": {

        "description": "Donation",

        "keywords": [

            "donate",
            "donation",
            "support us",
            "fundraising",
            "charity"

        ]

    },

    # ==========================================================
    # Coupon
    # ==========================================================

    "coupon": {

        "description": "Coupon",

        "keywords": [

            "coupon",
            "voucher",
            "discount",
            "promo code",
            "gift card"

        ]

    }

}

__all__ = [

    "PAYMENT_KEYWORDS"

]