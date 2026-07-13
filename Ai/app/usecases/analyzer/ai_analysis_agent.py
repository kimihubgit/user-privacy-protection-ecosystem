"""
AI Analysis Agent

Điều phối pipeline AI:
    Prompt → Gemini → Parse → Validate → dict
"""

from __future__ import annotations

from app.config.logger import logger
from app.infrastructure.ai.llm_analyzer import LLMAnalyzer
from app.infrastructure.ai.parsers.json_parser import LLMParser
from app.infrastructure.ai.parsers.response_validator import ResponseValidator
from app.infrastructure.ai.prompts.prompt_builder import PromptBuilder

_DEFAULTS: dict = {
    "analysis_type": "LLM",
    "risk_score": 50,
    "status": "malicious",
    "level": "Medium",
    "confidence": 0.0,
    "categories": [],
    "indicators": [],
    "reason": [],
}


class AIAnalysisAgent:
    """
    Điều phối pipeline AI.
    Không chứa Prompt, Gemini client, hay logic parse.
    """

    def __init__(self):
        self.prompt_builder = PromptBuilder()
        self.llm_analyzer = LLMAnalyzer()
        self.parser = LLMParser()
        self.validator = ResponseValidator()

    def analyze(self, summary: dict) -> dict:
        prompt = self.prompt_builder.build(summary)
        logger.info(f"[AIAgent] Prompt length: {len(prompt)}")

        response = self.llm_analyzer.analyze(prompt)
        logger.info(f"[AIAgent] Response length: {len(response)}")

        result = self.parser.parse(response)
        result = self.validator.validate(result)

        # Điền giá trị mặc định cho các trường bị thiếu
        result = _DEFAULTS | result

        logger.info(
            f"[AIAgent] status={result['status']} "
            f"score={result['risk_score']} "
            f"confidence={result['confidence']} "
            f"categories={result['categories']}"
        )
        return result
