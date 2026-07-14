"""
Evidence Database
-----------------

Adult Keyword Database

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

ADULT_KEYWORDS: dict[str, dict] = {

    # ==========================================================
    # Adult
    # ==========================================================

    "adult": {

        "description": "Adult Content",

        "keywords": [

            "adult",
            "18+",
            "nsfw",
            "xxx",
            "explicit",
            "mature content",
            "adult entertainment"

        ]

    },

    # ==========================================================
    # Pornography
    # ==========================================================

    "pornography": {

        "description": "Pornography",

        "keywords": [

            "porn",
            "pornography",
            "sex video",
            "sex movie",
            "xxx video",
            "adult video",
            "hot video"

        ]

    },

    # ==========================================================
    # Webcam
    # ==========================================================

    "webcam": {

        "description": "Adult Webcam",

        "keywords": [

            "live cam",
            "live webcam",
            "webcam",
            "camgirl",
            "cam model",
            "private show"

        ]

    },

    # ==========================================================
    # Dating
    # ==========================================================

    "dating": {

        "description": "Adult Dating",

        "keywords": [

            "dating",
            "hookup",
            "meet singles",
            "find partner",
            "adult dating"

        ]

    },

    # ==========================================================
    # Escort
    # ==========================================================

    "escort": {

        "description": "Escort",

        "keywords": [

            "escort",
            "escort service",
            "call girl",
            "booking escort"

        ]

    },

    # ==========================================================
    # Live Chat
    # ==========================================================

    "live_chat": {

        "description": "Adult Chat",

        "keywords": [

            "live chat",
            "private chat",
            "video chat",
            "chat now"

        ]

    },

    # ==========================================================
    # Premium
    # ==========================================================

    "premium": {

        "description": "Premium Adult",

        "keywords": [

            "premium access",
            "vip access",
            "unlock content",
            "exclusive content",
            "premium membership"

        ]

    },

    # ==========================================================
    # Subscription
    # ==========================================================

    "subscription": {

        "description": "Adult Subscription",

        "keywords": [

            "subscribe",
            "monthly subscription",
            "premium account",
            "membership"

        ]

    },

    # ==========================================================
    # Content
    # ==========================================================

    "content": {

        "description": "Adult Content",

        "keywords": [

            "gallery",
            "photo gallery",
            "exclusive video",
            "hd video",
            "private album"

        ]

    },

    # ==========================================================
    # Warning
    # ==========================================================

    "warning": {

        "description": "Adult Warning",

        "keywords": [

            "adults only",
            "age verification",
            "confirm your age",
            "18 or older",
            "mature audience"

        ]

    }

}

__all__ = [

    "ADULT_KEYWORDS"

]