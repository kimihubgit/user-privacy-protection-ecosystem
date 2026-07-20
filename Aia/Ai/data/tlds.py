"""
Evidence Database
-----------------

Top Level Domain Database

Knowledge Base dành cho URL Detector.

Nguyên tắc:
- Chỉ chứa dữ liệu
- Không chứa Rule
- Không chứa Logic
- Không chứa Risk Score
- Không chứa Confidence

Author: Anti Scam Detector
"""

from __future__ import annotations

# ==========================================================
# Government
# ==========================================================

GOVERNMENT_TLDS = {

    ".gov",

    ".gov.vn",

    ".gouv.fr",

    ".gov.uk",

    ".gov.au",

    ".gov.sg",

    ".gov.jp",

    ".gov.kr"

}

# ==========================================================
# Education
# ==========================================================

EDUCATION_TLDS = {

    ".edu",

    ".edu.vn",

    ".ac.uk",

    ".edu.au",

    ".ac.jp",

    ".edu.sg"

}

# ==========================================================
# Organization
# ==========================================================

ORGANIZATION_TLDS = {

    ".org",

    ".ngo"

}

# ==========================================================
# Commercial
# ==========================================================

COMMERCIAL_TLDS = {

    ".com",

    ".co",

    ".biz",

    ".shop",

    ".store"

}

# ==========================================================
# Technology
# ==========================================================

TECHNOLOGY_TLDS = {

    ".app",

    ".dev",

    ".tech",

    ".cloud",

    ".ai",

    ".software"

}

# ==========================================================
# Network
# ==========================================================

NETWORK_TLDS = {

    ".net",

    ".network"

}

# ==========================================================
# Country
# ==========================================================

COUNTRY_TLDS = {

    ".vn",

    ".us",

    ".uk",

    ".jp",

    ".kr",

    ".cn",

    ".sg",

    ".tw",

    ".hk",

    ".de",

    ".fr",

    ".ru",

    ".ca",

    ".au"

}

# ==========================================================
# Common New gTLD
# ==========================================================

NEW_GTLD = {

    ".online",

    ".site",

    ".website",

    ".world",

    ".today",

    ".live",

    ".life",

    ".group",

    ".company",

    ".email",

    ".support",

    ".services",

    ".digital",

    ".solutions"

}

# ==========================================================
# Dynamic DNS
# ==========================================================

DYNAMIC_DNS = {

    ".ddns.net",

    ".duckdns.org",

    ".no-ip.org",

    ".hopto.org",

    ".servehttp.com"

}

# ==========================================================
# Short Domain
# ==========================================================

SHORT_TLDS = {

    ".cc",

    ".to",

    ".io",

    ".me"

}

# ==========================================================
# Export
# ==========================================================

ALL_TLDS = (

    GOVERNMENT_TLDS

    | EDUCATION_TLDS

    | ORGANIZATION_TLDS

    | COMMERCIAL_TLDS

    | TECHNOLOGY_TLDS

    | NETWORK_TLDS

    | COUNTRY_TLDS

    | NEW_GTLD

    | DYNAMIC_DNS

    | SHORT_TLDS

)

__all__ = [

    "GOVERNMENT_TLDS",

    "EDUCATION_TLDS",

    "ORGANIZATION_TLDS",

    "COMMERCIAL_TLDS",

    "TECHNOLOGY_TLDS",

    "NETWORK_TLDS",

    "COUNTRY_TLDS",

    "NEW_GTLD",

    "DYNAMIC_DNS",

    "SHORT_TLDS",

    "ALL_TLDS"

]