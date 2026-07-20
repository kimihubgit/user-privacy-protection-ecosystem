"""
LLM Analyzer

Điều phối việc gọi LLM.
"""

from __future__ import annotations

from app.infrastructure.ai.clients.gemini_llm import GeminiLLM
from app.config.logger import logger


class LLMAnalyzer:

    def __init__(self):

        self.llm = GeminiLLM()

    def analyze(
        self,
        prompt: str
    ) -> str:

        logger.info("=" * 80)

        logger.info("LLM Analysis Started")

        logger.info(
            f"Prompt Length : {len(prompt)}"
        )

        response = self.llm.generate(
            prompt
        )

        logger.info(
            f"Response Length : {len(response)}"
        )

        logger.info("LLM Analysis Finished")

        logger.info("=" * 80)

        return response