"""
Evidence Database
-----------------

Suspicious URL Path Database

Knowledge Base dành cho URL Detector.

Nguyên tắc:
- Chỉ chứa dữ liệu
- Không chứa Logic
- Không chứa Rule
- Không chứa Risk Score
- Không chứa Confidence

Author: Anti Scam Detector
"""

from __future__ import annotations

SUSPICIOUS_PATHS: dict[str, dict] = {

    # ==========================================================
    # Authentication
    # ==========================================================

    "authentication": {

        "description": "Authentication Related",

        "paths": [

            "/login",
            "/signin",
            "/sign-in",
            "/auth",
            "/authenticate",
            "/account/login",
            "/member/login",
            "/user/login"

        ]

    },

    # ==========================================================
    # Verification
    # ==========================================================

    "verification": {

        "description": "Verification",

        "paths": [

            "/verify",
            "/verification",
            "/verify-account",
            "/verify-email",
            "/confirm",
            "/confirmation"

        ]

    },

    # ==========================================================
    # Password
    # ==========================================================

    "password": {

        "description": "Password",

        "paths": [

            "/password",
            "/reset-password",
            "/forgot-password",
            "/change-password",
            "/recover-password"

        ]

    },

    # ==========================================================
    # Account
    # ==========================================================

    "account": {

        "description": "Account",

        "paths": [

            "/account",
            "/profile",
            "/dashboard",
            "/user",
            "/member",
            "/customer"

        ]

    },

    # ==========================================================
    # Payment
    # ==========================================================

    "payment": {

        "description": "Payment",

        "paths": [

            "/payment",
            "/checkout",
            "/invoice",
            "/billing",
            "/pay",
            "/wallet"

        ]

    },

    # ==========================================================
    # Banking
    # ==========================================================

    "banking": {

        "description": "Banking",

        "paths": [

            "/ebanking",
            "/internet-banking",
            "/mobile-banking",
            "/transfer",
            "/transaction"

        ]

    },

    # ==========================================================
    # Crypto
    # ==========================================================

    "crypto": {

        "description": "Cryptocurrency",

        "paths": [

            "/wallet",
            "/staking",
            "/airdrop",
            "/claim",
            "/swap",
            "/bridge",
            "/connect-wallet"

        ]

    },

    # ==========================================================
    # Download
    # ==========================================================

    "download": {

        "description": "Download",

        "paths": [

            "/download",
            "/downloads",
            "/installer",
            "/setup",
            "/install",
            "/update"

        ]

    },

    # ==========================================================
    # API
    # ==========================================================

    "api": {

        "description": "API",

        "paths": [

            "/api",
            "/api/v1",
            "/api/v2",
            "/graphql",
            "/rest"

        ]

    },

    # ==========================================================
    # Admin
    # ==========================================================

    "admin": {

        "description": "Administration",

        "paths": [

            "/admin",
            "/administrator",
            "/cpanel",
            "/control-panel",
            "/manage"

        ]

    }

}

__all__ = [

    "SUSPICIOUS_PATHS"

]