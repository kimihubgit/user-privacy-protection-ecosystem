"""
Email Checker

Rule-based Email Analysis
"""

from __future__ import annotations

import re

import dns.resolver

from app.domain.entities.collector import CollectorResult
from app.domain.entities.check_result import CheckResult

EMAIL_REGEX = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")


TEMP_MAIL_DOMAINS = {
    "mailinator.com",
    "guerrillamail.com",
    "10minutemail.com",
    "temp-mail.org",
    "tempmail.com",
    "trashmail.com",
    "yopmail.com",
}


PUBLIC_MAIL = {"gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com"}


SUSPICIOUS_KEYWORDS = {
    "verify",
    "secure",
    "wallet",
    "bank",
    "login",
    "support",
    "account",
}


class EmailChecker:

    DNS_TIMEOUT = 5

    def __init__(self):

        self.resolver = dns.resolver.Resolver()

        self.resolver.timeout = self.DNS_TIMEOUT

        self.resolver.lifetime = self.DNS_TIMEOUT

    def check(self, collector: CollectorResult) -> CheckResult:

        score = 0

        reasons = []

        emails = list(dict.fromkeys(collector.emails))

        # =====================================
        # Rule 1 - No Email
        # =====================================

        if not emails:

            return CheckResult(
                name="email_checker",
                score=0,
                confidence=1.0,
                passed=True,
                reasons=[],
                metadata={},
            )

        # =====================================
        # Rule 2 - Too many emails
        # =====================================

        if len(emails) > 20:

            score += 10

            reasons.append("Website chứa quá nhiều email.")

        for email in emails:

            # =====================================
            # Rule 3 - Regex
            # =====================================

            if not EMAIL_REGEX.match(email):

                score += 15

                reasons.append(f"Email không hợp lệ: {email}")

                continue

            local, domain = email.lower().split("@")

            # =====================================
            # Rule 4 - Domain mismatch
            # =====================================

            if domain != collector.domain and domain not in PUBLIC_MAIL:

                score += 10

                reasons.append(f"Email sử dụng domain khác website: {domain}")

            # =====================================
            # Rule 5 - Temp Mail
            # =====================================

            if domain in TEMP_MAIL_DOMAINS:

                score += 25

                reasons.append(f"Email sử dụng email tạm thời: {domain}")

            # =====================================
            # Rule 6 - Suspicious Keyword
            # =====================================

            for keyword in SUSPICIOUS_KEYWORDS:

                if keyword in local:

                    score += 5

                    reasons.append(f"Email chứa từ khóa '{keyword}'.")

            # =====================================
            # Rule 7 - MX Record
            # =====================================

            try:

                self.resolver.resolve(domain, "MX")

            except Exception:

                score += 15

                reasons.append(f"Domain email không có MX: {domain}")

        # =====================================
        # Remove duplicate reasons
        # =====================================

        reasons = list(dict.fromkeys(reasons))

        # =====================================
        # Return
        # =====================================

        return CheckResult(
            name="email_checker",
            score=min(score, 100),
            confidence=0.95,
            passed=(score == 0),
            reasons=reasons,
            metadata={"emails": emails, "count": len(emails)},
        )
