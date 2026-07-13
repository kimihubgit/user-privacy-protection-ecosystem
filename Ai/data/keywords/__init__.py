"""
app.data.keywords
==================

Suspicious keyword reference data, grouped by threat category.

Schema (every entry in every *_KEYWORDS list follows this shape):

    {
        "keyword": str,     # lowercase token or short phrase to match against
        "category": str,    # one of app.data.categories.CATEGORIES keys
        "severity": str,    # "critical" | "high" | "medium" | "low"
    }

No matching/normalization logic (regex, fuzzy match, stemming) lives
here -- that belongs to the detector layer. This package only stores
the raw literal keyword lists.
"""

from app.data.keywords.phishing import PHISHING_KEYWORDS
from app.data.keywords.banking import BANKING_KEYWORDS
from app.data.keywords.crypto import CRYPTO_KEYWORDS
from app.data.keywords.malware import MALWARE_KEYWORDS
from app.data.keywords.gambling import GAMBLING_KEYWORDS
from app.data.keywords.payment import PAYMENT_KEYWORDS
from app.data.keywords.adult import ADULT_KEYWORDS

ALL_KEYWORDS = (
    PHISHING_KEYWORDS
    + BANKING_KEYWORDS
    + CRYPTO_KEYWORDS
    + MALWARE_KEYWORDS
    + GAMBLING_KEYWORDS
    + PAYMENT_KEYWORDS
    + ADULT_KEYWORDS
)

__all__ = [
    "PHISHING_KEYWORDS",
    "BANKING_KEYWORDS",
    "CRYPTO_KEYWORDS",
    "MALWARE_KEYWORDS",
    "GAMBLING_KEYWORDS",
    "PAYMENT_KEYWORDS",
    "ADULT_KEYWORDS",
    "ALL_KEYWORDS",
]
