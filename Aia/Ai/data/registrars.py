"""
Evidence Database
-----------------

Domain Registrar Database

Knowledge Base dành cho Domain Detector.

Nguyên tắc:
- Chỉ chứa dữ liệu
- Không chứa Logic
- Không chứa Rule
- Không chứa Risk Score
- Không chứa Confidence

Author: Anti Scam Detector
"""

from __future__ import annotations

REGISTRARS = {

    "cloudflare": [

        "Cloudflare",

        "Cloudflare, Inc."

    ],

    "godaddy": [

        "GoDaddy",

        "GoDaddy.com, LLC"

    ],

    "namecheap": [

        "NameCheap",

        "NameCheap, Inc."

    ],

    "google": [

        "Google Domains",

        "Google LLC"

    ],

    "squarespace": [

        "Squarespace",

        "Squarespace Domains LLC"

    ],

    "enom": [

        "eNom",

        "eNom LLC"

    ],

    "networksolutions": [

        "Network Solutions"

    ],

    "tucows": [

        "Tucows",

        "Tucows Domains Inc."

    ],

    "gandi": [

        "Gandi",

        "Gandi SAS"

    ],

    "ovh": [

        "OVH",

        "OVH SAS"

    ],

    "porkbun": [

        "Porkbun"

    ],

    "dynadot": [

        "Dynadot"

    ],

    "hexonet": [

        "HEXONET"

    ],

    "amazon": [

        "Amazon Registrar"

    ],

    "markmonitor": [

        "MarkMonitor"

    ]

}

__all__ = [

    "REGISTRARS"

]