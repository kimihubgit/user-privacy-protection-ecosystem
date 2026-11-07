"""
Evidence Database
-----------------

Category Database

Knowledge Base dành cho toàn bộ hệ thống.

Nguyên tắc:
- Chỉ chứa dữ liệu
- Không chứa Logic
- Không chứa Rule
- Không chứa Risk Score
- Không chứa Confidence

Author: Anti Scam Detector
"""

from __future__ import annotations

CATEGORIES: dict[str, dict] = {

    # ==========================================================
    # Unknown
    # ==========================================================

    "unknown": {

        "display_name": "Unknown",

        "description": "Cannot determine website category"

    },

    # ==========================================================
    # Business
    # ==========================================================

    "business": {

        "display_name": "Business",

        "description": "Business and corporate website"

    },

    # ==========================================================
    # Education
    # ==========================================================

    "education": {

        "display_name": "Education",

        "description": "School, university or online learning"

    },

    # ==========================================================
    # Government
    # ==========================================================

    "government": {

        "display_name": "Government",

        "description": "Government organization"

    },

    # ==========================================================
    # Banking
    # ==========================================================

    "banking": {

        "display_name": "Banking",

        "description": "Banking and financial institution"

    },

    # ==========================================================
    # Payment
    # ==========================================================

    "payment": {

        "display_name": "Payment",

        "description": "Payment service"

    },

    # ==========================================================
    # E-Commerce
    # ==========================================================

    "ecommerce": {

        "display_name": "E-Commerce",

        "description": "Online shopping"

    },

    # ==========================================================
    # Technology
    # ==========================================================

    "technology": {

        "display_name": "Technology",

        "description": "Technology company or product"

    },

    # ==========================================================
    # Social
    # ==========================================================

    "social": {

        "display_name": "Social",

        "description": "Social media platform"

    },

    # ==========================================================
    # Cryptocurrency
    # ==========================================================

    "crypto": {

        "display_name": "Cryptocurrency",

        "description": "Blockchain, crypto, Web3"

    },

    # ==========================================================
    # News
    # ==========================================================

    "news": {

        "display_name": "News",

        "description": "News and media"

    },

    # ==========================================================
    # Entertainment
    # ==========================================================

    "entertainment": {

        "display_name": "Entertainment",

        "description": "Movies, music, streaming"

    },

    # ==========================================================
    # Healthcare
    # ==========================================================

    "healthcare": {

        "display_name": "Healthcare",

        "description": "Healthcare and medical"

    },

    # ==========================================================
    # Travel
    # ==========================================================

    "travel": {

        "display_name": "Travel",

        "description": "Travel and tourism"

    },

    # ==========================================================
    # Gaming
    # ==========================================================

    "gaming": {

        "display_name": "Gaming",

        "description": "Games and gaming services"

    },

    # ==========================================================
    # Gambling
    # ==========================================================

    "gambling": {

        "display_name": "Gambling",

        "description": "Betting and gambling"

    },

    # ==========================================================
    # Adult
    # ==========================================================

    "adult": {

        "display_name": "Adult",

        "description": "Adult content"

    },

    # ==========================================================
    # Malware
    # ==========================================================

    "malware": {

        "display_name": "Malware",

        "description": "Malware distribution"

    },

    # ==========================================================
    # Phishing
    # ==========================================================

    "phishing": {

        "display_name": "Phishing",

        "description": "Credential theft"

    },

    # ==========================================================
    # Scam
    # ==========================================================

    "scam": {

        "display_name": "Scam",

        "description": "Fraud and scam"

    }

}

__all__ = [

    "CATEGORIES"

]