"""
Evidence Database
-----------------

Autonomous System Number (ASN) Database

Knowledge Base dành cho Network Detector.

Nguyên tắc:
- Chỉ chứa dữ liệu
- Không chứa Logic
- Không chứa Rule
- Không chứa Risk Score
- Không chứa Confidence

Author: Anti Scam Detector
"""

from __future__ import annotations

ASN_DATABASE: dict[str, dict] = {

    # ==========================================================
    # Cloudflare
    # ==========================================================

    "AS13335": {

        "organization": "Cloudflare, Inc.",

        "provider": "Cloudflare",

        "country": "US"

    },

    # ==========================================================
    # Google
    # ==========================================================

    "AS15169": {

        "organization": "Google LLC",

        "provider": "Google",

        "country": "US"

    },

    # ==========================================================
    # Amazon AWS
    # ==========================================================

    "AS16509": {

        "organization": "Amazon.com, Inc.",

        "provider": "Amazon Web Services",

        "country": "US"

    },

    # ==========================================================
    # Microsoft Azure
    # ==========================================================

    "AS8075": {

        "organization": "Microsoft Corporation",

        "provider": "Microsoft Azure",

        "country": "US"

    },

    # ==========================================================
    # Oracle Cloud
    # ==========================================================

    "AS31898": {

        "organization": "Oracle Corporation",

        "provider": "Oracle Cloud",

        "country": "US"

    },

    # ==========================================================
    # Akamai
    # ==========================================================

    "AS20940": {

        "organization": "Akamai Technologies",

        "provider": "Akamai",

        "country": "US"

    },

    # ==========================================================
    # Fastly
    # ==========================================================

    "AS54113": {

        "organization": "Fastly, Inc.",

        "provider": "Fastly",

        "country": "US"

    },

    # ==========================================================
    # DigitalOcean
    # ==========================================================

    "AS14061": {

        "organization": "DigitalOcean, LLC",

        "provider": "DigitalOcean",

        "country": "US"

    },

    # ==========================================================
    # OVHcloud
    # ==========================================================

    "AS16276": {

        "organization": "OVH SAS",

        "provider": "OVHcloud",

        "country": "FR"

    },

    # ==========================================================
    # Hetzner
    # ==========================================================

    "AS24940": {

        "organization": "Hetzner Online GmbH",

        "provider": "Hetzner",

        "country": "DE"

    },

    # ==========================================================
    # Vultr
    # ==========================================================

    "AS20473": {

        "organization": "The Constant Company",

        "provider": "Vultr",

        "country": "US"

    },

    # ==========================================================
    # Linode
    # ==========================================================

    "AS63949": {

        "organization": "Linode LLC",

        "provider": "Linode",

        "country": "US"

    },

    # ==========================================================
    # Alibaba Cloud
    # ==========================================================

    "AS45102": {

        "organization": "Alibaba Cloud",

        "provider": "Alibaba Cloud",

        "country": "CN"

    },

    # ==========================================================
    # Tencent Cloud
    # ==========================================================

    "AS132203": {

        "organization": "Tencent Cloud",

        "provider": "Tencent Cloud",

        "country": "CN"

    },

    # ==========================================================
    # Huawei Cloud
    # ==========================================================

    "AS136907": {

        "organization": "Huawei Cloud",

        "provider": "Huawei Cloud",

        "country": "CN"

    },

    # ==========================================================
    # Viettel IDC
    # ==========================================================

    "AS7552": {

        "organization": "Viettel Group",

        "provider": "Viettel IDC",

        "country": "VN"

    },

    # ==========================================================
    # VNPT
    # ==========================================================

    "AS45899": {

        "organization": "VNPT",

        "provider": "VNPT",

        "country": "VN"

    },

    # ==========================================================
    # FPT Telecom
    # ==========================================================

    "AS18403": {

        "organization": "FPT Telecom",

        "provider": "FPT",

        "country": "VN"

    },

    # ==========================================================
    # CMC Telecom
    # ==========================================================

    "AS131429": {

        "organization": "CMC Telecom",

        "provider": "CMC",

        "country": "VN"

    }

}

__all__ = [

    "ASN_DATABASE"

]