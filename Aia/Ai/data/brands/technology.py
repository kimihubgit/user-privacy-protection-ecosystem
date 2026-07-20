"""
Evidence Database
-----------------

Technology Brand Database

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

TECHNOLOGY_BRANDS: dict[str, dict] = {

    # ==========================================================
    # Google
    # ==========================================================

    "google": {

        "display_name": "Google",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "google.com",

            "google.com.vn"

        ],

        "aliases": [

            "google llc",

            "alphabet"

        ]

    },

    # ==========================================================
    # Microsoft
    # ==========================================================

    "microsoft": {

        "display_name": "Microsoft",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "microsoft.com",

            "live.com",

            "office.com",

            "outlook.com"

        ],

        "aliases": [

            "ms",

            "microsoft corporation"

        ]

    },

    # ==========================================================
    # Apple
    # ==========================================================

    "apple": {

        "display_name": "Apple",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "apple.com",

            "icloud.com"

        ],

        "aliases": [

            "apple inc"

        ]

    },

    # ==========================================================
    # OpenAI
    # ==========================================================

    "openai": {

        "display_name": "OpenAI",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "openai.com",

            "chatgpt.com"

        ],

        "aliases": [

            "chatgpt",

            "gpt",

            "gpt-4",

            "gpt-5"

        ]

    },

    # ==========================================================
    # GitHub
    # ==========================================================

    "github": {

        "display_name": "GitHub",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "github.com"

        ],

        "aliases": [

            "github inc"

        ]

    },

    # ==========================================================
    # GitLab
    # ==========================================================

    "gitlab": {

        "display_name": "GitLab",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "gitlab.com"

        ],

        "aliases": [

            "gitlab inc"

        ]

    },

    # ==========================================================
    # Amazon
    # ==========================================================

    "amazon": {

        "display_name": "Amazon",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "amazon.com"

        ],

        "aliases": [

            "amazon web services",

            "aws"

        ]

    },

    # ==========================================================
    # AWS
    # ==========================================================

    "aws": {

        "display_name": "Amazon Web Services",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "aws.amazon.com"

        ],

        "aliases": [

            "amazon aws"

        ]

    },

    # ==========================================================
    # Oracle
    # ==========================================================

    "oracle": {

        "display_name": "Oracle",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "oracle.com"

        ],

        "aliases": [

            "oracle corporation"

        ]

    },

    # ==========================================================
    # IBM
    # ==========================================================

    "ibm": {

        "display_name": "IBM",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "ibm.com"

        ],

        "aliases": [

            "international business machines"

        ]

    },

    # ==========================================================
    # Intel
    # ==========================================================

    "intel": {

        "display_name": "Intel",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "intel.com"

        ],

        "aliases": [

            "intel corporation"

        ]

    },

    # ==========================================================
    # AMD
    # ==========================================================

    "amd": {

        "display_name": "AMD",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "amd.com"

        ],

        "aliases": [

            "advanced micro devices"

        ]

    },

    # ==========================================================
    # NVIDIA
    # ==========================================================

    "nvidia": {

        "display_name": "NVIDIA",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "nvidia.com"

        ],

        "aliases": [

            "nvidia corporation"

        ]

    },

    # ==========================================================
    # Cisco
    # ==========================================================

    "cisco": {

        "display_name": "Cisco",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "cisco.com"

        ],

        "aliases": [

            "cisco systems"

        ]

    },

    # ==========================================================
    # VMware
    # ==========================================================

    "vmware": {

        "display_name": "VMware",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "vmware.com"

        ],

        "aliases": [

            "broadcom vmware"

        ]

    },

    # ==========================================================
    # Dell
    # ==========================================================

    "dell": {

        "display_name": "Dell",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "dell.com"

        ],

        "aliases": [

            "dell technologies"

        ]

    },

    # ==========================================================
    # HP
    # ==========================================================

    "hp": {

        "display_name": "HP",

        "country": "US",

        "category": "Technology",

        "official_domains": [

            "hp.com"

        ],

        "aliases": [

            "hewlett packard",

            "hewlett-packard"

        ]

    },

    # ==========================================================
    # Lenovo
    # ==========================================================

    "lenovo": {

        "display_name": "Lenovo",

        "country": "CN",

        "category": "Technology",

        "official_domains": [

            "lenovo.com"

        ],

        "aliases": [

            "lenovo group"

        ]

    },

    # ==========================================================
    # Xiaomi
    # ==========================================================

    "xiaomi": {

        "display_name": "Xiaomi",

        "country": "CN",

        "category": "Technology",

        "official_domains": [

            "mi.com",

            "xiaomi.com"

        ],

        "aliases": [

            "mi"

        ]

    },

    # ==========================================================
    # Samsung
    # ==========================================================

    "samsung": {

        "display_name": "Samsung",

        "country": "KR",

        "category": "Technology",

        "official_domains": [

            "samsung.com"

        ],

        "aliases": [

            "samsung electronics"

        ]

    }

}