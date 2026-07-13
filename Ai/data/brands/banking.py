"""
Evidence Database
-----------------

Banking Brand Database

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

BANKING_BRANDS: dict[str, dict] = {

    # ==========================================================
    # Vietcombank
    # ==========================================================

    "vietcombank": {

        "display_name": "Vietcombank",

        "country": "VN",

        "category": "Banking",

        "official_domains": [

            "vietcombank.com.vn",

            "vcb.com.vn"

        ],

        "aliases": [

            "vcb",

            "ngân hàng ngoại thương",

            "ngan hang ngoai thuong",

            "vietcom bank"

        ]

    },

    # ==========================================================
    # BIDV
    # ==========================================================

    "bidv": {

        "display_name": "BIDV",

        "country": "VN",

        "category": "Banking",

        "official_domains": [

            "bidv.com.vn"

        ],

        "aliases": [

            "bank for investment and development of vietnam"

        ]

    },

    # ==========================================================
    # VietinBank
    # ==========================================================

    "vietinbank": {

        "display_name": "VietinBank",

        "country": "VN",

        "category": "Banking",

        "official_domains": [

            "vietinbank.vn"

        ],

        "aliases": [

            "vietin",

            "ctg",

            "incombank"

        ]

    },

    # ==========================================================
    # Agribank
    # ==========================================================

    "agribank": {

        "display_name": "Agribank",

        "country": "VN",

        "category": "Banking",

        "official_domains": [

            "agribank.com.vn"

        ],

        "aliases": [

            "agri bank",

            "ngân hàng nông nghiệp",

            "ngan hang nong nghiep"

        ]

    },

    # ==========================================================
    # Techcombank
    # ==========================================================

    "techcombank": {

        "display_name": "Techcombank",

        "country": "VN",

        "category": "Banking",

        "official_domains": [

            "techcombank.com.vn"

        ],

        "aliases": [

            "tcb"

        ]

    },

    # ==========================================================
    # ACB
    # ==========================================================

    "acb": {

        "display_name": "Asia Commercial Bank",

        "country": "VN",

        "category": "Banking",

        "official_domains": [

            "acb.com.vn"

        ],

        "aliases": [

            "asia commercial bank"

        ]

    },

    # ==========================================================
    # MB Bank
    # ==========================================================

    "mbbank": {

        "display_name": "MB Bank",

        "country": "VN",

        "category": "Banking",

        "official_domains": [

            "mbbank.com.vn",

            "mbbank.com"

        ],

        "aliases": [

            "mb",

            "military bank",

            "quan doi"

        ]

    },

    # ==========================================================
    # VPBank
    # ==========================================================

    "vpbank": {

        "display_name": "VPBank",

        "country": "VN",

        "category": "Banking",

        "official_domains": [

            "vpbank.com.vn"

        ],

        "aliases": [

            "viet nam prosperity bank"

        ]

    },

    # ==========================================================
    # Sacombank
    # ==========================================================

    "sacombank": {

        "display_name": "Sacombank",

        "country": "VN",

        "category": "Banking",

        "official_domains": [

            "sacombank.com.vn"

        ],

        "aliases": [

            "sacom bank"

        ]

    },

    # ==========================================================
    # HDBank
    # ==========================================================

    "hdbank": {

        "display_name": "HDBank",

        "country": "VN",

        "category": "Banking",

        "official_domains": [

            "hdbank.com.vn"

        ],

        "aliases": [

            "hd bank"

        ]

    },

    # ==========================================================
    # TPBank
    # ==========================================================

    "tpbank": {

        "display_name": "TPBank",

        "country": "VN",

        "category": "Banking",

        "official_domains": [

            "tpb.vn",

            "tpbank.com.vn"

        ],

        "aliases": [

            "tien phong bank"

        ]

    },

    # ==========================================================
    # SHB
    # ==========================================================

    "shb": {

        "display_name": "SHB",

        "country": "VN",

        "category": "Banking",

        "official_domains": [

            "shb.com.vn"

        ],

        "aliases": [

            "saigon hanoi bank"

        ]

    },

    # ==========================================================
    # SeABank
    # ==========================================================

    "seabank": {

        "display_name": "SeABank",

        "country": "VN",

        "category": "Banking",

        "official_domains": [

            "seabank.com.vn"

        ],

        "aliases": [

            "sea bank"

        ]

    },

    # ==========================================================
    # OCB
    # ==========================================================

    "ocb": {

        "display_name": "OCB",

        "country": "VN",

        "category": "Banking",

        "official_domains": [

            "ocb.com.vn"

        ],

        "aliases": [

            "orient commercial bank"

        ]

    },

    # ==========================================================
    # Eximbank
    # ==========================================================

    "eximbank": {

        "display_name": "Eximbank",

        "country": "VN",

        "category": "Banking",

        "official_domains": [

            "eximbank.com.vn"

        ],

        "aliases": [

            "viet nam export import bank"

        ]

    },

    # ==========================================================
    # HSBC
    # ==========================================================

    "hsbc": {

        "display_name": "HSBC",

        "country": "GB",

        "category": "Banking",

        "official_domains": [

            "hsbc.com",

            "hsbc.com.vn"

        ],

        "aliases": [

            "hongkong shanghai banking corporation"

        ]

    },

    # ==========================================================
    # Citibank
    # ==========================================================

    "citibank": {

        "display_name": "Citibank",

        "country": "US",

        "category": "Banking",

        "official_domains": [

            "citibank.com"

        ],

        "aliases": [

            "citi"

        ]

    },

    # ==========================================================
    # Bank of America
    # ==========================================================

    "bankofamerica": {

        "display_name": "Bank of America",

        "country": "US",

        "category": "Banking",

        "official_domains": [

            "bankofamerica.com"

        ],

        "aliases": [

            "boa"

        ]

    },

    # ==========================================================
    # Chase
    # ==========================================================

    "chase": {

        "display_name": "Chase",

        "country": "US",

        "category": "Banking",

        "official_domains": [

            "chase.com"

        ],

        "aliases": [

            "jp morgan chase",

            "jpmorgan"

        ]

    },

    # ==========================================================
    # Wells Fargo
    # ==========================================================

    "wellsfargo": {

        "display_name": "Wells Fargo",

        "country": "US",

        "category": "Banking",

        "official_domains": [

            "wellsfargo.com"

        ],

        "aliases": [

            "wells"

        ]

    }

}