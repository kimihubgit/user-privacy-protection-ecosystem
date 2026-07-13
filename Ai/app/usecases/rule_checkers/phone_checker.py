"""
Phone Checker

Rule-based Phone Analysis
"""

from __future__ import annotations

import phonenumbers

from app.domain.entities.collector import CollectorResult
from app.domain.entities.check_result import CheckResult

VN_MOBILE_PREFIX = {
    "032",
    "033",
    "034",
    "035",
    "036",
    "037",
    "038",
    "039",
    "070",
    "076",
    "077",
    "078",
    "079",
    "081",
    "082",
    "083",
    "084",
    "085",
    "086",
    "088",
    "089",
    "090",
    "091",
    "092",
    "093",
    "094",
    "096",
    "097",
    "098",
    "099",
}


class PhoneChecker:

    def check(self, collector: CollectorResult) -> CheckResult:

        score = 0

        reasons = []

        phones = list(dict.fromkeys(collector.phones))

        #
        # Rule 1
        #

        if not phones:

            return CheckResult(
                name="phone_checker",
                score=0,
                confidence=1.0,
                passed=True,
                reasons=[],
                metadata={},
            )

        #
        # Rule 2
        #

        if len(phones) > 10:

            score += 10

            reasons.append("Website chứa quá nhiều số điện thoại.")

        for phone in phones:

            #
            # Rule 3
            #

            try:

                parsed = phonenumbers.parse(phone, "VN")

            except Exception:

                score += 20

                reasons.append(f"Số điện thoại không hợp lệ: {phone}")

                continue

            #
            # Rule 4
            #

            if not phonenumbers.is_valid_number(parsed):

                score += 20

                reasons.append(f"Số điện thoại không hợp lệ: {phone}")

            #
            # Rule 5
            #

            national = str(parsed.national_number)

            national = "0" + national

            if national.startswith("1800"):

                continue

            if national.startswith("1900"):

                continue

            prefix = national[:3]

            if prefix not in VN_MOBILE_PREFIX:

                score += 5

                reasons.append(f"Đầu số bất thường: {phone}")

        return CheckResult(
            name="phone_checker",
            score=min(score, 100),
            confidence=0.95,
            passed=(score == 0),
            reasons=list(dict.fromkeys(reasons)),
            metadata={"phones": phones, "count": len(phones)},
        )
