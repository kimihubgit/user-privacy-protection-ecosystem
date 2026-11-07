"""
OSINT Checker

Rule-based OSINT Analysis
"""

from __future__ import annotations

from app.osint.providers.chongluadao_provider import ChongLuaDaoProvider

from app.schemas.collector_result import CollectorResult
from app.schemas.check_result import CheckResult


class OSINTChecker:
    """
    OSINT Checker

    Chuẩn hóa kết quả từ ChongLuaDao
    thành CheckResult.
    """

    def __init__(self):

        self.provider = ChongLuaDaoProvider()

    def check(
        self,
        collector: CollectorResult
    ) -> CheckResult:

        result = self.provider.lookup(
            collector.final_url or collector.url
        )

        # =====================================
        # Provider Error
        # =====================================

        if not result["success"]:

            return CheckResult(

                name="osint_checker",

                score=0,

                confidence=0.0,

                passed=True,

                reasons=[],

                metadata={

                    "provider": "ChongLuaDao",

                    "available": False

                }

            )

        data = result.get("data", {})

        # =====================================
        # Empty Response
        # =====================================

        if not data:

            return CheckResult(

                name="osint_checker",

                score=0,

                confidence=0.0,

                passed=True,

                reasons=[],

                metadata={

                    "provider": "ChongLuaDao",

                    "available": True

                }

            )

        api_status = data.get("status", 0)

        api_result = str(
            data.get("result", "")
        ).lower()

        details = str(
            data.get("details", "")
        )

        # =====================================
        # Malicious
        # =====================================

        if api_status == 200 and api_result == "malicious":

            return CheckResult(

                name="osint_checker",

                score=100,

                confidence=1.0,

                passed=False,

                reasons=[details],

                metadata={

                    "provider": "ChongLuaDao",

                    "result": api_result

                }

            )

        # =====================================
        # Suspicious
        # =====================================

        if api_result == "suspicious":

            return CheckResult(

                name="osint_checker",

                score=60,

                confidence=1.0,

                passed=False,

                reasons=[details],

                metadata={

                    "provider": "ChongLuaDao",

                    "result": api_result

                }

            )

        # =====================================
        # Safe
        # =====================================

        return CheckResult(

            name="osint_checker",

            score=0,

            confidence=1.0,

            passed=True,

            reasons=[],

            metadata={

                "provider": "ChongLuaDao",

                "result": api_result

            }

        )