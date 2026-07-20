"""
Evidence Database
-----------------

Cloud Provider Database

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

CLOUD_PROVIDERS: dict[str, dict] = {

    # ==========================================================
    # Amazon Web Services
    # ==========================================================

    "aws": {

        "provider": "Amazon Web Services",

        "aliases": [

            "Amazon",

            "Amazon AWS",

            "Amazon.com",

            "AWS"

        ]

    },

    # ==========================================================
    # Microsoft Azure
    # ==========================================================

    "azure": {

        "provider": "Microsoft Azure",

        "aliases": [

            "Microsoft",

            "Microsoft Azure",

            "Azure"

        ]

    },

    # ==========================================================
    # Google Cloud
    # ==========================================================

    "gcp": {

        "provider": "Google Cloud",

        "aliases": [

            "Google",

            "Google LLC",

            "Google Cloud",

            "Google Cloud Platform",

            "GCP"

        ]

    },

    # ==========================================================
    # Cloudflare
    # ==========================================================

    "cloudflare": {

        "provider": "Cloudflare",

        "aliases": [

            "Cloudflare",

            "Cloudflare, Inc."

        ]

    },

    # ==========================================================
    # Oracle Cloud
    # ==========================================================

    "oracle": {

        "provider": "Oracle Cloud",

        "aliases": [

            "Oracle",

            "Oracle Corporation",

            "Oracle Cloud"

        ]

    },

    # ==========================================================
    # Alibaba Cloud
    # ==========================================================

    "alibaba": {

        "provider": "Alibaba Cloud",

        "aliases": [

            "Alibaba",

            "Alibaba Cloud"

        ]

    },

    # ==========================================================
    # Tencent Cloud
    # ==========================================================

    "tencent": {

        "provider": "Tencent Cloud",

        "aliases": [

            "Tencent",

            "Tencent Cloud"

        ]

    },

    # ==========================================================
    # Huawei Cloud
    # ==========================================================

    "huawei": {

        "provider": "Huawei Cloud",

        "aliases": [

            "Huawei",

            "Huawei Cloud"

        ]

    },

    # ==========================================================
    # DigitalOcean
    # ==========================================================

    "digitalocean": {

        "provider": "DigitalOcean",

        "aliases": [

            "DigitalOcean",

            "Digital Ocean"

        ]

    },

    # ==========================================================
    # OVHcloud
    # ==========================================================

    "ovh": {

        "provider": "OVHcloud",

        "aliases": [

            "OVH",

            "OVH SAS",

            "OVHcloud"

        ]

    },

    # ==========================================================
    # Hetzner
    # ==========================================================

    "hetzner": {

        "provider": "Hetzner",

        "aliases": [

            "Hetzner",

            "Hetzner Online GmbH"

        ]

    },

    # ==========================================================
    # Vultr
    # ==========================================================

    "vultr": {

        "provider": "Vultr",

        "aliases": [

            "Vultr",

            "The Constant Company"

        ]

    },

    # ==========================================================
    # Linode
    # ==========================================================

    "linode": {

        "provider": "Linode",

        "aliases": [

            "Linode"

        ]

    },

    # ==========================================================
    # Akamai
    # ==========================================================

    "akamai": {

        "provider": "Akamai",

        "aliases": [

            "Akamai",

            "Akamai Technologies"

        ]

    },

    # ==========================================================
    # Fastly
    # ==========================================================

    "fastly": {

        "provider": "Fastly",

        "aliases": [

            "Fastly",

            "Fastly Inc."

        ]

    },

    # ==========================================================
    # Viettel IDC
    # ==========================================================

    "viettel": {

        "provider": "Viettel IDC",

        "aliases": [

            "Viettel",

            "Viettel IDC"

        ]

    },

    # ==========================================================
    # VNPT
    # ==========================================================

    "vnpt": {

        "provider": "VNPT",

        "aliases": [

            "VNPT"

        ]

    },

    # ==========================================================
    # FPT
    # ==========================================================

    "fpt": {

        "provider": "FPT",

        "aliases": [

            "FPT",

            "FPT Telecom"

        ]

    },

    # ==========================================================
    # CMC
    # ==========================================================

    "cmc": {

        "provider": "CMC",

        "aliases": [

            "CMC",

            "CMC Telecom"

        ]

    }

}

__all__ = [

    "CLOUD_PROVIDERS"

]