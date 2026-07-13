"""
LLM Parser
"""

from __future__ import annotations

import json
import re

from pydantic import ValidationError

from app.presentation.api.schemas.indicator import Indicator
from app.presentation.api.schemas.llm_result import LLMResult

from app.config.logger import logger


class LLMParser:
    """
    Parse Gemini response into LLMResult.
    """

    def parse(
        self,
        response: str,
    ) -> LLMResult:

        logger.info("=" * 80)
        logger.info("Parsing Gemini Response")

        response = self._clean_response(response)

        try:

            data = json.loads(response)

            #
            # Normalize indicators
            #

            indicators = []

            for item in data.get("indicators", []):

                if isinstance(item, dict):

                    indicators.append(

                        Indicator(

                            indicator=item.get(
                                "indicator",
                                ""
                            ),

                            reason=item.get(
                                "reason",
                                ""
                            ),

                            severity=item.get(
                                "severity",
                                "Low"
                            ),

                        )

                    )

                elif isinstance(item, str):

                    indicators.append(

                        Indicator(

                            indicator=item,

                            reason="",

                            severity="Low",

                        )

                    )

            data["indicators"] = indicators

            result = LLMResult.model_validate(data)

            logger.info("Gemini response parsed successfully.")
            logger.info(f"Status      : {result.status}")
            logger.info(f"Risk Score  : {result.risk_score}")
            logger.info(f"Confidence  : {result.confidence}")
            logger.info("=" * 80)

            return result

        except json.JSONDecodeError as ex:

            logger.exception(ex)

            logger.warning(
                "Gemini returned invalid JSON."
            )

            return self._fallback()

        except ValidationError as ex:

            logger.exception(ex)

            logger.warning(
                "Gemini response does not match schema."
            )

            return self._fallback()

        except Exception as ex:

            logger.exception(ex)

            logger.warning(
                "Unexpected parser error."
            )

            return self._fallback()

    @staticmethod
    def _clean_response(
        response: str,
    ) -> str:
        """
        Remove Markdown fences and extract JSON.
        """

        response = response.strip()

        response = re.sub(
            r"^```json",
            "",
            response,
            flags=re.IGNORECASE,
        )

        response = re.sub(
            r"^```",
            "",
            response,
            flags=re.IGNORECASE,
        )

        response = re.sub(
            r"```$",
            "",
            response,
        )

        response = response.strip()

        match = re.search(
            r"\{.*\}",
            response,
            flags=re.DOTALL,
        )

        if match:

            return match.group(0)

        return response

    @staticmethod
    def _fallback() -> LLMResult:
        """
        Default fallback when parsing fails.
        """

        return LLMResult(

            analysis_type="Fallback",

            risk_score=50,

            status="unknown",

            level="Medium",

            confidence=0.0,

            categories=[
                "Unknown"
            ],

            indicators=[

                Indicator(

                    indicator="Parse Error",

                    reason="Không thể phân tích phản hồi từ AI.",

                    severity="Low",

                )

            ],

            summary="Không thể tạo kết quả phân tích.",

            reason=[

                "Không thể phân tích phản hồi từ AI nên hệ thống sử dụng kết quả dự phòng."

            ],

            recommendations=[

                "Thử phân tích lại sau."

            ],

        )