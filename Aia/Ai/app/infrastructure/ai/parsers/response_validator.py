"""
Response Validator

Kiểm tra và chuẩn hóa kết quả trả về từ LLM.
"""

from __future__ import annotations

from app.presentation.api.schemas.llm_result import LLMResult

class ResponseValidator:

    ALLOWED_STATUS = {
        "safe",
        "suspicious",
        "malicious",
        "unknown",
    }

    ALLOWED_LEVEL = {
        "Low",
        "Medium",
        "High",
    }

    def validate(
        self,
        result: LLMResult,
    ) -> LLMResult:

        #
        # Risk Score
        #

        try:
            result.risk_score = int(result.risk_score)
        except Exception:
            result.risk_score = 50

        result.risk_score = max(
            0,
            min(result.risk_score, 100),
        )

        #
        # Status
        #

        status = str(result.status).lower()

        if status not in self.ALLOWED_STATUS:

            if result.risk_score <= 20:
                result.status = "safe"

            elif result.risk_score <= 60:
                result.status = "suspicious"

            else:
                result.status = "malicious"

        else:

            result.status = status

        #
        # Level
        #

        if result.level not in self.ALLOWED_LEVEL:

            if result.risk_score <= 20:

                result.level = "Low"

            elif result.risk_score <= 60:

                result.level = "Medium"

            else:

                result.level = "High"

        #
        # Confidence
        #

        try:

            result.confidence = float(
                result.confidence
            )

        except Exception:

            result.confidence = 0.5

        result.confidence = max(
            0.0,
            min(result.confidence, 1.0),
        )

        #
        # Categories
        #

        if result.categories is None:

            result.categories = []

        elif not isinstance(
            result.categories,
            list,
        ):

            result.categories = [
                str(result.categories)
            ]

        #
        # Indicators
        #
        # Indicator đã được parser chuyển thành
        # List[Indicator], chỉ cần đảm bảo
        # không bị None.
        #

        if result.indicators is None:

            result.indicators = []

        #
        # Reason
        #

        if result.reason is None:

            result.reason = []

        elif isinstance(
            result.reason,
            str,
        ):

            result.reason = [
                result.reason
            ]

        elif not isinstance(
            result.reason,
            list,
        ):

            result.reason = []

        #
        # Chỉ giữ 1 đoạn giải thích
        #

        if len(result.reason) > 1:

            result.reason = [
                result.reason[0]
            ]

        #
        # Summary
        #

        if not result.summary:

            if result.reason:

                result.summary = result.reason[0]

            else:

                result.summary = (
                    "Không có giải thích."
                )

        #
        # Analysis Type
        #

        if not result.analysis_type:

            result.analysis_type = "LLM"

        return result