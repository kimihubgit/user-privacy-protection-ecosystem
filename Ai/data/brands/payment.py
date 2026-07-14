"""
Evidence Database
-----------------

Payment Brand Database

Knowledge Base dành cho Brand Detector.

Nguyên tắc:
- Chỉ chứa dữ liệu.
- Không chứa business logic.
- Không chứa Risk Score.
- Không chứa Confidence.
- Không chứa Rule.

Author: Anti Scam Detector
"""

from __future__ import annotations

PAYMENT_BRANDS: dict[str, dict] = {

    # ==========================================================
    # PayPal
    # ==========================================================

    "paypal": {

        "display_name": "PayPal",

        "country": "US",

        "category": "Payment",

        "official_domains": [

            "paypal.com"

        ],

        "aliases": [

            "paypal holdings"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Visa
    # ==========================================================

    "visa": {

        "display_name": "Visa",

        "country": "US",

        "category": "Payment",

        "official_domains": [

            "visa.com"

        ],

        "aliases": [

            "visa card"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Mastercard
    # ==========================================================

    "mastercard": {

        "display_name": "Mastercard",

        "country": "US",

        "category": "Payment",

        "official_domains": [

            "mastercard.com"

        ],

        "aliases": [

            "master card"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # American Express
    # ==========================================================

    "americanexpress": {

        "display_name": "American Express",

        "country": "US",

        "category": "Payment",

        "official_domains": [

            "americanexpress.com",

            "amex.com"

        ],

        "aliases": [

            "american express"

        ],

        "weak_aliases": [

            "amex"

        ]

    },

    # ==========================================================
    # Stripe
    # ==========================================================

    "stripe": {

        "display_name": "Stripe",

        "country": "US",

        "category": "Payment",

        "official_domains": [

            "stripe.com"

        ],

        "aliases": [

            "stripe payments"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Skrill
    # ==========================================================

    "skrill": {

        "display_name": "Skrill",

        "country": "GB",

        "category": "Payment",

        "official_domains": [

            "skrill.com"

        ],

        "aliases": [],

        "weak_aliases": []

    },

    # ==========================================================
    # Neteller
    # ==========================================================

    "neteller": {

        "display_name": "Neteller",

        "country": "GB",

        "category": "Payment",

        "official_domains": [

            "neteller.com"

        ],

        "aliases": [],

        "weak_aliases": []

    },

    # ==========================================================
    # Wise
    # ==========================================================

    "wise": {

        "display_name": "Wise",

        "country": "GB",

        "category": "Payment",

        "official_domains": [

            "wise.com"

        ],

        "aliases": [

            "transferwise"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Payoneer
    # ==========================================================

    "payoneer": {

        "display_name": "Payoneer",

        "country": "US",

        "category": "Payment",

        "official_domains": [

            "payoneer.com"

        ],

        "aliases": [],

        "weak_aliases": []

    },

    # ==========================================================
    # Google Pay
    # ==========================================================

    "googlepay": {

        "display_name": "Google Pay",

        "country": "US",

        "category": "Payment",

        "official_domains": [

            "pay.google.com"

        ],

        "aliases": [

            "google pay"

        ],

        "weak_aliases": [

            "gpay"

        ]

    },

    # ==========================================================
    # Apple Pay
    # ==========================================================

    "applepay": {

        "display_name": "Apple Pay",

        "country": "US",

        "category": "Payment",

        "official_domains": [

            "apple.com"

        ],

        "aliases": [

            "apple pay"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Samsung Pay
    # ==========================================================

    "samsungpay": {

        "display_name": "Samsung Pay",

        "country": "KR",

        "category": "Payment",

        "official_domains": [

            "samsung.com"

        ],

        "aliases": [

            "samsung pay"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # MoMo
    # ==========================================================

    "momo": {

        "display_name": "MoMo",

        "country": "VN",

        "category": "Payment",

        "official_domains": [

            "momo.vn"

        ],

        "aliases": [

            "vi momo",

            "momo e-wallet"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # ZaloPay
    # ==========================================================

    "zalopay": {

        "display_name": "ZaloPay",

        "country": "VN",

        "category": "Payment",

        "official_domains": [

            "zalopay.vn"

        ],

        "aliases": [

            "zalo pay"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # ShopeePay
    # ==========================================================

    "shopeepay": {

        "display_name": "ShopeePay",

        "country": "SG",

        "category": "Payment",

        "official_domains": [

            "shopeepay.vn",

            "shopee.vn"

        ],

        "aliases": [

            "shopee pay"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # VNPay
    # ==========================================================

    "vnpay": {

        "display_name": "VNPay",

        "country": "VN",

        "category": "Payment",

        "official_domains": [

            "vnpay.vn"

        ],

        "aliases": [

            "vn pay"

        ],

        "weak_aliases": []

    }

}