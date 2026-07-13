"""
Evidence Database
-----------------

Banking Keyword Database

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

BANKING_KEYWORDS: dict[str, dict] = {

    # ==========================================================
    # Banking
    # ==========================================================

    "bank": {

        "description": "Bank",

        "keywords": [

            "bank",
            "ngân hàng",
            "ngan hang",
            "financial institution"

        ]

    },

    # ==========================================================
    # Internet Banking
    # ==========================================================

    "internet_banking": {

        "description": "Internet Banking",

        "keywords": [

            "internet banking",
            "online banking",
            "mobile banking",
            "ebanking",
            "e-banking"

        ]

    },

    # ==========================================================
    # Account
    # ==========================================================

    "account": {

        "description": "Bank Account",

        "keywords": [

            "account",
            "account number",
            "bank account",
            "số tài khoản",
            "tai khoan"

        ]

    },

    # ==========================================================
    # Card
    # ==========================================================

    "card": {

        "description": "Bank Card",

        "keywords": [

            "atm",
            "visa",
            "mastercard",
            "debit card",
            "credit card",
            "prepaid card"

        ]

    },

    # ==========================================================
    # Transaction
    # ==========================================================

    "transaction": {

        "description": "Transaction",

        "keywords": [

            "transaction",
            "giao dịch",
            "chuyển khoản",
            "transfer",
            "wire transfer",
            "bank transfer"

        ]

    },

    # ==========================================================
    # Balance
    # ==========================================================

    "balance": {

        "description": "Balance",

        "keywords": [

            "balance",
            "available balance",
            "account balance",
            "số dư"

        ]

    },

    # ==========================================================
    # Statement
    # ==========================================================

    "statement": {

        "description": "Statement",

        "keywords": [

            "statement",
            "bank statement",
            "transaction history",
            "account history"

        ]

    },

    # ==========================================================
    # Loan
    # ==========================================================

    "loan": {

        "description": "Loan",

        "keywords": [

            "loan",
            "mortgage",
            "credit",
            "consumer loan",
            "personal loan"

        ]

    },

    # ==========================================================
    # Savings
    # ==========================================================

    "saving": {

        "description": "Savings",

        "keywords": [

            "saving",
            "saving account",
            "deposit",
            "term deposit",
            "fixed deposit"

        ]

    },

    # ==========================================================
    # Authentication
    # ==========================================================

    "authentication": {

        "description": "Authentication",

        "keywords": [

            "otp",
            "smart otp",
            "soft otp",
            "token",
            "security token"

        ]

    }

}

__all__ = [

    "BANKING_KEYWORDS"

]