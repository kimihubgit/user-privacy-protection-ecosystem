SUSPICIOUS = {"login", "verify", "secure", "update", "wallet", "signin", "confirm"}


class URLDetector:

    def detect(self, url: str) -> dict:

        lower = url.lower()

        hits = [k for k in SUSPICIOUS if k in lower]

        return {"suspicious_url": len(hits) > 0, "suspicious_keywords": hits}
