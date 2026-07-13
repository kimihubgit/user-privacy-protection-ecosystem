"""
Evidence Database
-----------------

E-Commerce Brand Database

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

ECOMMERCE_BRANDS: dict[str, dict] = {

    # ==========================================================
    # Amazon
    # ==========================================================

    "amazon": {

        "display_name": "Amazon",

        "country": "US",

        "category": "Ecommerce",

        "official_domains": [

            "amazon.com"

        ],

        "aliases": [

            "amazon shopping"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # eBay
    # ==========================================================

    "ebay": {

        "display_name": "eBay",

        "country": "US",

        "category": "Ecommerce",

        "official_domains": [

            "ebay.com"

        ],

        "aliases": [],

        "weak_aliases": []

    },

    # ==========================================================
    # AliExpress
    # ==========================================================

    "aliexpress": {

        "display_name": "AliExpress",

        "country": "CN",

        "category": "Ecommerce",

        "official_domains": [

            "aliexpress.com"

        ],

        "aliases": [

            "ali express"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Alibaba
    # ==========================================================

    "alibaba": {

        "display_name": "Alibaba",

        "country": "CN",

        "category": "Ecommerce",

        "official_domains": [

            "alibaba.com"

        ],

        "aliases": [],

        "weak_aliases": []

    },

    # ==========================================================
    # Shopee
    # ==========================================================

    "shopee": {

        "display_name": "Shopee",

        "country": "SG",

        "category": "Ecommerce",

        "official_domains": [

            "shopee.vn",

            "shopee.sg",

            "shopee.com"

        ],

        "aliases": [

            "shopee mall"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Lazada
    # ==========================================================

    "lazada": {

        "display_name": "Lazada",

        "country": "SG",

        "category": "Ecommerce",

        "official_domains": [

            "lazada.vn",

            "lazada.com"

        ],

        "aliases": [

            "lazada mall"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Tiki
    # ==========================================================

    "tiki": {

        "display_name": "Tiki",

        "country": "VN",

        "category": "Ecommerce",

        "official_domains": [

            "tiki.vn"

        ],

        "aliases": [

            "tiki trading"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Sendo
    # ==========================================================

    "sendo": {

        "display_name": "Sendo",

        "country": "VN",

        "category": "Ecommerce",

        "official_domains": [

            "sendo.vn"

        ],

        "aliases": [

            "sen do"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # TikTok Shop
    # ==========================================================

    "tiktokshop": {

        "display_name": "TikTok Shop",

        "country": "CN",

        "category": "Ecommerce",

        "official_domains": [

            "seller-vn.tiktok.com",

            "shop.tiktok.com"

        ],

        "aliases": [

            "tiktok shop"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Temu
    # ==========================================================

    "temu": {

        "display_name": "Temu",

        "country": "CN",

        "category": "Ecommerce",

        "official_domains": [

            "temu.com"

        ],

        "aliases": [],

        "weak_aliases": []

    },

    # ==========================================================
    # Shein
    # ==========================================================

    "shein": {

        "display_name": "SHEIN",

        "country": "SG",

        "category": "Ecommerce",

        "official_domains": [

            "shein.com"

        ],

        "aliases": [

            "she in"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Walmart
    # ==========================================================

    "walmart": {

        "display_name": "Walmart",

        "country": "US",

        "category": "Ecommerce",

        "official_domains": [

            "walmart.com"

        ],

        "aliases": [],

        "weak_aliases": []

    },

    # ==========================================================
    # Best Buy
    # ==========================================================

    "bestbuy": {

        "display_name": "Best Buy",

        "country": "US",

        "category": "Ecommerce",

        "official_domains": [

            "bestbuy.com"

        ],

        "aliases": [

            "best buy"

        ],

        "weak_aliases": []

    },

    # ==========================================================
    # Etsy
    # ==========================================================

    "etsy": {

        "display_name": "Etsy",

        "country": "US",

        "category": "Ecommerce",

        "official_domains": [

            "etsy.com"

        ],

        "aliases": [],

        "weak_aliases": []

    },

    # ==========================================================
    # Rakuten
    # ==========================================================

    "rakuten": {

        "display_name": "Rakuten",

        "country": "JP",

        "category": "Ecommerce",

        "official_domains": [

            "rakuten.co.jp",

            "rakuten.com"

        ],

        "aliases": [

            "rakuten ichiba"

        ],

        "weak_aliases": []

    }

}