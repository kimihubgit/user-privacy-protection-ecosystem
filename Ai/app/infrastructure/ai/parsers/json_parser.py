"""
LLM Parser
"""

from __future__ import annotations

import json
import re

from app.config.logger import logger


class LLMParser:

    def parse(self, response: str) -> dict:

        logger.info("Parse Gemini Response")

        #
        # Xóa markdown
        #

        response = response.strip()

        response = re.sub(r"^```json", "", response, flags=re.IGNORECASE)

        response = re.sub(r"^```", "", response, flags=re.IGNORECASE)

        response = re.sub(r"```$", "", response)

        response = response.strip()

        try:

            return json.loads(response)

        except Exception as ex:

            logger.exception(ex)

            return {
                "analysis_type": "LLM",
                "risk_score": 50,
                "status": "malicious",
                "level": "Medium",
                "confidence": 0.0,
                "categories": ["Unknown"],
                "indicators": ["Parse Error"],
                "reason": ["Không thể phân tích phản hồi của AI."],
            }
