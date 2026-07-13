"""
Evidence Database
-----------------

SSL / TLS Database

Knowledge Base dành cho SSL Detector.

Nguyên tắc:
- Chỉ chứa dữ liệu
- Không chứa Logic
- Không chứa Rule
- Không chứa Risk Score
- Không chứa Confidence

Author: Anti Scam Detector
"""

from __future__ import annotations

SSL_DATABASE: dict[str, dict] = {

    # ==========================================================
    # Certificate Version
    # ==========================================================

    "version": {

        "description": "Certificate Version",

        "values": [

            "v1",

            "v2",

            "v3"

        ]

    },

    # ==========================================================
    # Certificate Validation
    # ==========================================================

    "validation": {

        "description": "Certificate Validation",

        "values": [

            "DV",

            "OV",

            "EV"

        ]

    },

    # ==========================================================
    # Certificate Status
    # ==========================================================

    "status": {

        "description": "Certificate Status",

        "values": [

            "Valid",

            "Expired",

            "Revoked",

            "Self-Signed",

            "Unknown"

        ]

    },

    # ==========================================================
    # Key Algorithm
    # ==========================================================

    "key_algorithm": {

        "description": "Key Algorithm",

        "values": [

            "RSA",

            "ECDSA",

            "DSA",

            "Ed25519"

        ]

    },

    # ==========================================================
    # Signature Algorithm
    # ==========================================================

    "signature_algorithm": {

        "description": "Signature Algorithm",

        "values": [

            "SHA1",

            "SHA256",

            "SHA384",

            "SHA512"

        ]

    },

    # ==========================================================
    # TLS Version
    # ==========================================================

    "tls_version": {

        "description": "TLS Version",

        "values": [

            "TLS 1.0",

            "TLS 1.1",

            "TLS 1.2",

            "TLS 1.3"

        ]

    },

    # ==========================================================
    # Subject Alternative Name
    # ==========================================================

    "subject_alt_name": {

        "description": "Subject Alternative Name",

        "values": [

            "DNS",

            "IP"

        ]

    },

    # ==========================================================
    # Wildcard
    # ==========================================================

    "wildcard": {

        "description": "Wildcard Certificate",

        "values": [

            True,

            False

        ]

    },

    # ==========================================================
    # Public Key Size
    # ==========================================================

    "key_size": {

        "description": "Public Key Size",

        "values": [

            1024,

            2048,

            3072,

            4096

        ]

    },

    # ==========================================================
    # Common Issuers
    # ==========================================================

    "issuer": {

        "description": "Certificate Issuer",

        "values": [

            "Let's Encrypt",

            "Google Trust Services",

            "Sectigo",

            "DigiCert",

            "GlobalSign",

            "GoDaddy",

            "Cloudflare",

            "ZeroSSL",

            "Amazon",

            "Microsoft"

        ]

    },

    # ==========================================================
    # OCSP
    # ==========================================================

    "ocsp": {

        "description": "OCSP Status",

        "values": [

            "Supported",

            "Unsupported"

        ]

    },

    # ==========================================================
    # HSTS
    # ==========================================================

    "hsts": {

        "description": "HTTP Strict Transport Security",

        "values": [

            True,

            False

        ]

    }

}

__all__ = [

    "SSL_DATABASE"

]