"""
IP Checker

Rule-based IP Analysis
"""

from __future__ import annotations

import ipaddress

from app.domain.entities.collector import CollectorResult
from app.domain.entities.check_result import CheckResult


class IPChecker:
    """
    Đánh giá độ tin cậy của địa chỉ IP.

    Collector chịu trách nhiệm lấy IP.

    Checker chỉ đánh giá.
    """

    def check(self, collector: CollectorResult) -> CheckResult:

        score = 0

        reasons = []

        ipv4_list = list(dict.fromkeys(collector.ipv4))

        ipv6_list = list(dict.fromkeys(collector.ipv6))

        #
        # Rule 1
        #

        if not ipv4_list and not ipv6_list:

            return CheckResult(
                name="ip_checker",
                score=0,
                confidence=1.0,
                passed=True,
                reasons=[],
                metadata={},
            )

        #
        # Rule 2
        #

        if len(ipv4_list) > 10:

            score += 10

            reasons.append("Website có quá nhiều IPv4.")

        #
        # Rule 3
        #

        if len(ipv6_list) > 10:

            score += 5

            reasons.append("Website có quá nhiều IPv6.")

        #
        # Rule 4
        #

        for ip in ipv4_list:

            try:

                addr = ipaddress.ip_address(ip)

            except ValueError:

                score += 25

                reasons.append(f"IPv4 không hợp lệ: {ip}")

                continue

            if addr.is_private:

                score += 30

                reasons.append(f"IPv4 private: {ip}")

            if addr.is_loopback:

                score += 30

                reasons.append(f"IPv4 loopback: {ip}")

            if addr.is_multicast:

                score += 20

                reasons.append(f"IPv4 multicast: {ip}")

            if addr.is_reserved:

                score += 20

                reasons.append(f"IPv4 reserved: {ip}")

        #
        # Rule 5
        #

        for ip in ipv6_list:

            try:

                addr = ipaddress.ip_address(ip)

            except ValueError:

                score += 25

                reasons.append(f"IPv6 không hợp lệ: {ip}")

                continue

            if addr.is_loopback:

                score += 30

                reasons.append(f"IPv6 loopback: {ip}")

            if addr.is_multicast:

                score += 20

                reasons.append(f"IPv6 multicast: {ip}")

            if addr.is_reserved:

                score += 20

                reasons.append(f"IPv6 reserved: {ip}")

        return CheckResult(
            name="ip_checker",
            score=min(score, 100),
            confidence=0.95,
            passed=(score == 0),
            reasons=list(dict.fromkeys(reasons)),
            metadata={
                "ipv4": ipv4_list,
                "ipv6": ipv6_list,
                "ipv4_count": len(ipv4_list),
                "ipv6_count": len(ipv6_list),
            },
        )
