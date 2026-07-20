"""
Evidence Database
-----------------

Social Media Brand Database

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

SOCIAL_BRANDS: dict[str, dict] = {

    # ==========================================================
    # Facebook
    # ==========================================================

    "facebook": {

        "display_name": "Facebook",

        "country": "US",

        "category": "Social",

        "official_domains": [

            "facebook.com",

            "fb.com"

        ],

        "aliases": [

            "fb",

            "facebook inc",

            "meta"

        ]

    },

    # ==========================================================
    # Messenger
    # ==========================================================

    "messenger": {

        "display_name": "Messenger",

        "country": "US",

        "category": "Social",

        "official_domains": [

            "messenger.com"

        ],

        "aliases": [

            "facebook messenger"

        ]

    },

    # ==========================================================
    # Instagram
    # ==========================================================

    "instagram": {

        "display_name": "Instagram",

        "country": "US",

        "category": "Social",

        "official_domains": [

            "instagram.com"

        ],

        "aliases": [

            "insta",

            "ig"

        ]

    },

    # ==========================================================
    # Threads
    # ==========================================================

    "threads": {

        "display_name": "Threads",

        "country": "US",

        "category": "Social",

        "official_domains": [

            "threads.net"

        ],

        "aliases": [

            "meta threads"

        ]

    },

    # ==========================================================
    # WhatsApp
    # ==========================================================

    "whatsapp": {

        "display_name": "WhatsApp",

        "country": "US",

        "category": "Social",

        "official_domains": [

            "whatsapp.com"

        ],

        "aliases": [

            "whats app"

        ]

    },

    # ==========================================================
    # X (Twitter)
    # ==========================================================

    "twitter": {

        "display_name": "X",

        "country": "US",

        "category": "Social",

        "official_domains": [

            "x.com",

            "twitter.com"

        ],

        "aliases": [

            "twitter",

            "x",

            "tweet"

        ]

    },

    # ==========================================================
    # TikTok
    # ==========================================================

    "tiktok": {

        "display_name": "TikTok",

        "country": "CN",

        "category": "Social",

        "official_domains": [

            "tiktok.com"

        ],

        "aliases": [

            "tik tok",

            "douyin"

        ]

    },

    # ==========================================================
    # YouTube
    # ==========================================================

    "youtube": {

        "display_name": "YouTube",

        "country": "US",

        "category": "Social",

        "official_domains": [

            "youtube.com",

            "youtu.be"

        ],

        "aliases": [

            "youtube studio"

        ]

    },

    # ==========================================================
    # Telegram
    # ==========================================================

    "telegram": {

        "display_name": "Telegram",

        "country": "AE",

        "category": "Social",

        "official_domains": [

            "telegram.org"

        ],

        "aliases": [

            "telegram messenger"

        ]

    },

    # ==========================================================
    # Discord
    # ==========================================================

    "discord": {

        "display_name": "Discord",

        "country": "US",

        "category": "Social",

        "official_domains": [

            "discord.com",

            "discord.gg"

        ],

        "aliases": [

            "discordapp"

        ]

    },

    # ==========================================================
    # Reddit
    # ==========================================================

    "reddit": {

        "display_name": "Reddit",

        "country": "US",

        "category": "Social",

        "official_domains": [

            "reddit.com"

        ],

        "aliases": [

            "redd.it"

        ]

    },

    # ==========================================================
    # LinkedIn
    # ==========================================================

    "linkedin": {

        "display_name": "LinkedIn",

        "country": "US",

        "category": "Social",

        "official_domains": [

            "linkedin.com"

        ],

        "aliases": [

            "linked in"

        ]

    },

    # ==========================================================
    # Snapchat
    # ==========================================================

    "snapchat": {

        "display_name": "Snapchat",

        "country": "US",

        "category": "Social",

        "official_domains": [

            "snapchat.com"

        ],

        "aliases": [

            "snap"

        ]

    },

    # ==========================================================
    # Pinterest
    # ==========================================================

    "pinterest": {

        "display_name": "Pinterest",

        "country": "US",

        "category": "Social",

        "official_domains": [

            "pinterest.com"

        ],

        "aliases": [

            "pin"

        ]

    },

    # ==========================================================
    # WeChat
    # ==========================================================

    "wechat": {

        "display_name": "WeChat",

        "country": "CN",

        "category": "Social",

        "official_domains": [

            "wechat.com",

            "weixin.qq.com"

        ],

        "aliases": [

            "weixin"

        ]

    },

    # ==========================================================
    # LINE
    # ==========================================================

    "line": {

        "display_name": "LINE",

        "country": "JP",

        "category": "Social",

        "official_domains": [

            "line.me"

        ],

        "aliases": [

            "line messenger"

        ]

    },

    # ==========================================================
    # Zalo
    # ==========================================================

    "zalo": {

        "display_name": "Zalo",

        "country": "VN",

        "category": "Social",

        "official_domains": [

            "zalo.me",

            "zaloapp.com"

        ],

        "aliases": [

            "zalo pay",

            "zalo pc"

        ]

    }

}