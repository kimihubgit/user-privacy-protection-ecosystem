"""
app.data.brands
================

Brand impersonation reference data, grouped by industry vertical.

Schema (every entry in every *_BRANDS list follows this shape):

    {
        "display_name": str,       # canonical human-readable brand name
        "domains": [str, ...],     # official/legitimate domains (lowercase, no scheme)
        "aliases": [str, ...],     # common misspellings / alt names attackers imitate
        "category": str,           # one of app.data.categories.CATEGORIES keys
        "risk_profile": str,       # "critical" | "high" | "medium" | "low"
    }

`risk_profile` reflects how attractive the brand is as a phishing target
(financial impact, credential value, reach) -- it is NOT a measurement of
the brand itself being risky.

DATA_SOURCE_NOTE: domain lists are intentionally non-exhaustive seed sets
covering primary/regional domains only. Extend as needed; do not add
logic here.
"""

from data.brands.banking import BANKING_BRANDS
from data.brands.technology import TECHNOLOGY_BRANDS
from data.brands.social import SOCIAL_BRANDS
from data.brands.payment import PAYMENT_BRANDS
from data.brands.ecommerce import ECOMMERCE_BRANDS
from data.brands.crypto import CRYPTO_BRANDS
from data.brands.government import GOVERNMENT_BRANDS
from data.brands.education import EDUCATION_BRANDS

ALL_BRANDS = (
    BANKING_BRANDS
    + TECHNOLOGY_BRANDS
    + SOCIAL_BRANDS
    + PAYMENT_BRANDS
    + ECOMMERCE_BRANDS
    + CRYPTO_BRANDS
    + GOVERNMENT_BRANDS
    + EDUCATION_BRANDS
)

__all__ = [
    "BANKING_BRANDS",
    "TECHNOLOGY_BRANDS",
    "SOCIAL_BRANDS",
    "PAYMENT_BRANDS",
    "ECOMMERCE_BRANDS",
    "CRYPTO_BRANDS",
    "GOVERNMENT_BRANDS",
    "EDUCATION_BRANDS",
    "ALL_BRANDS",
]
