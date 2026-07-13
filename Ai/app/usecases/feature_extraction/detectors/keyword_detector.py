from app.usecases.feature_extraction.constants import (
    BANK_KEYWORDS,
    CRYPTO_KEYWORDS,
    GAMBLING_KEYWORDS,
)


class KeywordDetector:

    def detect(self, text: str) -> dict:

        lower = text.lower()

        return {
            "bank_keywords": [k for k in BANK_KEYWORDS if k in lower],
            "crypto_keywords": [k for k in CRYPTO_KEYWORDS if k in lower],
            "gambling_keywords": [k for k in GAMBLING_KEYWORDS if k in lower],
        }
