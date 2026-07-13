"""
Risk Engine

Tổng hợp kết quả từ các Checker.
"""

from __future__ import annotations

from app.domain.entities.check_result import CheckResult


class RiskEngine:

    SAFE_THRESHOLD = 30

    SUSPICIOUS_THRESHOLD = 70

    def calculate(self, *results: CheckResult) -> dict:

        total_score = 0.0

        total_weight = 0.0

        confidence = 0.0

        reasons = []

        #
        # Weight
        #

        weights = {
            "url_checker": 0.30,
            "email_checker": 0.10,
            "phone_checker": 0.10,
            "ip_checker": 0.10,
            "osint_checker": 0.40,
        }

        for result in results:

            weight = weights.get(result.name, 0)

            total_score += result.score * weight

            total_weight += weight

            confidence += result.confidence

            reasons.extend(result.reasons)

        if total_weight > 0:

            risk_score = round(total_score / total_weight)

            confidence = round(confidence / len(results), 2)

        else:

            risk_score = 0

            confidence = 1.0

        if risk_score < self.SAFE_THRESHOLD:

            status = "Safe"

        elif risk_score < self.SUSPICIOUS_THRESHOLD:

            status = "Suspicious"

        else:

            status = "Phishing"

        return {
            "risk_score": min(risk_score, 100),
            "status": status,
            "confidence": confidence,
            "reason": list(dict.fromkeys(reasons)),
        }
