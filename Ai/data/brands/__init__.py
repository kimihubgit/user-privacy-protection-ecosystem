"""
Evidence Database
-----------------

Brand Database

Tập hợp toàn bộ Brand Database.

Author: Anti Scam Detector
"""

from __future__ import annotations

from .banking import BANKING_BRANDS
from .technology import TECHNOLOGY_BRANDS
from .social import SOCIAL_BRANDS
from .payment import PAYMENT_BRANDS
from .ecommerce import ECOMMERCE_BRANDS
from .crypto import CRYPTO_BRANDS
from .government import GOVERNMENT_BRANDS
from .education import EDUCATION_BRANDS

# ==========================================================
# Merge All Brand Database
# ==========================================================

BRANDS: dict[str, dict] = {}

for database in (

    BANKING_BRANDS,

    TECHNOLOGY_BRANDS,

    SOCIAL_BRANDS,

    PAYMENT_BRANDS,

    ECOMMERCE_BRANDS,

    CRYPTO_BRANDS,

    GOVERNMENT_BRANDS,

    EDUCATION_BRANDS,

):
    BRANDS.update(database)

# ==========================================================
# Export
# ==========================================================

__all__ = [

    "BANKING_BRANDS",

    "TECHNOLOGY_BRANDS",

    "SOCIAL_BRANDS",

    "PAYMENT_BRANDS",

    "ECOMMERCE_BRANDS",

    "CRYPTO_BRANDS",

    "GOVERNMENT_BRANDS",

    "EDUCATION_BRANDS",

    "BRANDS",

]