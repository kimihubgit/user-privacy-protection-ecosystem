"""
URL Checker

Rule-based URL Analysis
"""

from __future__ import annotations

import ipaddress
from urllib.parse import urlparse

from app.domain.entities.check_result import CheckResult
from app.domain.entities.collector import CollectorResult

SUSPICIOUS_KEYWORDS = [
    "login",
    "verify",
    "secure",
    "account",
    "update",
    "wallet",
    "signin",
    "confirm",
    "payment",
    "bank",
]


SUSPICIOUS_TLDS = {"zip", "top", "click", "work", "xyz", "gq", "cf", "tk"}


class URLChecker:

    def check(self, collector: CollectorResult) -> CheckResult:

        score = 0

        reasons = []

        url = collector.final_url or collector.url

        parsed = urlparse(url)

        hostname = collector.hostname.lower()

        # =====================================
        # Rule 1 - HTTPS
        # =====================================

        if parsed.scheme != "https":

            score += 20

            reasons.append("Website không sử dụng HTTPS.")

        # =====================================
        # Rule 2 - IP Address URL
        # =====================================

        try:

            ipaddress.ip_address(hostname)

            score += 30

            reasons.append("URL sử dụng địa chỉ IP.")

        except ValueError:

            pass

        # =====================================
        # Rule 3 - URL Length
        # =====================================

        if len(url) > 100:

            score += 5

            reasons.append("URL quá dài.")

        # =====================================
        # Rule 4 - @ Symbol
        # =====================================

        if "@" in url:

            score += 20

            reasons.append("URL chứa ký tự @.")

        # =====================================
        # Rule 5 - Punycode
        # =====================================

        if "xn--" in hostname:

            score += 30

            reasons.append("Tên miền sử dụng Punycode.")

        # =====================================
        # Rule 6 - Double //
        # =====================================

        if url.count("//") > 1:

            score += 10

            reasons.append("URL có nhiều dấu //.")

        # =====================================
        # Rule 7 - Too many '-'
        # =====================================

        if hostname.count("-") >= 3:

            score += 10

            reasons.append("Tên miền có nhiều dấu '-'.")

        # =====================================
        # Rule 8 - Too many subdomains
        # =====================================

        if hostname.count(".") >= 4:

            score += 10

            reasons.append("Tên miền có quá nhiều subdomain.")

        # =====================================
        # Rule 9 - Suspicious TLD
        # =====================================

        tld = hostname.split(".")[-1]

        if tld in SUSPICIOUS_TLDS:

            score += 15

            reasons.append(f"TLD '.{tld}' có rủi ro cao.")

        # =====================================
        # Rule 10 - Suspicious Keywords
        # =====================================

        lower = url.lower()

        for keyword in SUSPICIOUS_KEYWORDS:

            if keyword in lower:

                score += 8

                reasons.append(f"URL chứa từ khóa '{keyword}'.")

        # =====================================
        # Remove duplicate reasons
        # =====================================

        reasons = list(dict.fromkeys(reasons))

        # =====================================
        # Return
        # =====================================

        return CheckResult(
            name="url_checker",
            score=min(score, 100),
            confidence=0.95,
            passed=(score == 0),
            reasons=reasons,
            metadata={
                "hostname": hostname,
                "scheme": parsed.scheme,
                "length": len(url),
            },
        )
