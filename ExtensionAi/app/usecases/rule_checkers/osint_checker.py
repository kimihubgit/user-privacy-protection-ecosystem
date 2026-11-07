"""
OSINT Checker
"""

from __future__ import annotations

from app.infrastructure.osint.providers.chongluadao_provider import ChongLuaDaoProvider
from app.domain.entities.collector import CollectorResult
from app.domain.entities.check_result import CheckResult


class OSINTChecker:

    def __init__(self):

        self.provider = ChongLuaDaoProvider()

    def check(self, collector: CollectorResult) -> CheckResult:

        result = self.provider.lookup(collector.final_url or collector.url)

        #
        # Provider Error
        #

        if not result["success"]:

            return CheckResult(
                name="osint_checker",
                score=0,
                confidence=0.0,
                passed=True,
                reasons=[],
                metadata={"provider": "ChongLuaDao", "available": False},
            )

        data = result["data"]

        #
        # Empty Response
        #

        if not data:

            return CheckResult(
                name="osint_checker",
                score=0,
                confidence=0.0,
                passed=True,
                reasons=[],
                metadata={"provider": "ChongLuaDao", "available": True},
            )

        api_result = str(data.get("result", "")).lower()

        details = str(data.get("details", ""))

        #
        # malicious
        #

        if api_result == "malicious":

            return CheckResult(
                name="osint_checker",
                score=100,
                confidence=1.0,
                passed=False,
                reasons=[details],
                metadata={"provider": "ChongLuaDao", "result": api_result},
            )

        #
        # suspicious
        #

        if api_result == "suspicious":

            return CheckResult(
                name="osint_checker",
                score=60,
                confidence=1.0,
                passed=False,
                reasons=[details],
                metadata={"provider": "ChongLuaDao", "result": api_result},
            )

        #
        # clean / safe
        #

        return CheckResult(
            name="osint_checker",
            score=0,
            confidence=1.0,
            passed=True,
            reasons=[],
            metadata={"provider": "ChongLuaDao", "result": api_result},
        )
