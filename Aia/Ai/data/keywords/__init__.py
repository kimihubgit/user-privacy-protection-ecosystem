"""
Evidence Database

Keyword Database
"""

from .phishing import PHISHING_KEYWORDS
from .banking import BANKING_KEYWORDS
from .payment import PAYMENT_KEYWORDS
from .crypto import CRYPTO_KEYWORDS
from .malware import MALWARE_KEYWORDS
from .gambling import GAMBLING_KEYWORDS
from .adult import ADULT_KEYWORDS

KEYWORDS = {

    "phishing": PHISHING_KEYWORDS,

    "banking": BANKING_KEYWORDS,

    "payment": PAYMENT_KEYWORDS,

    "crypto": CRYPTO_KEYWORDS,

    "malware": MALWARE_KEYWORDS,

    "gambling": GAMBLING_KEYWORDS,

    "adult": ADULT_KEYWORDS,

}

__all__ = [

    "PHISHING_KEYWORDS",

    "BANKING_KEYWORDS",

    "PAYMENT_KEYWORDS",

    "CRYPTO_KEYWORDS",

    "MALWARE_KEYWORDS",

    "GAMBLING_KEYWORDS",

    "ADULT_KEYWORDS",

    "KEYWORDS"

]