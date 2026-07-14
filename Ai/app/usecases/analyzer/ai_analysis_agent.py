"""
AI Analysis Agent

Pipeline

CollectorResult + EvidenceResult
      │
      ▼
Prompt Builder
      │
      ▼
LLM Analyzer
      │
      ▼
Gemini
      │
      ▼
LLM Parser
      │
      ▼
LLMResult
      │
      ▼
Response Validator
"""

from __future__ import annotations

from app.infrastructure.ai.prompts.prompt_builder import PromptBuilder
from app.infrastructure.ai.llm_analyzer import LLMAnalyzer
from app.infrastructure.ai.parsers.json_parser import LLMParser
from app.infrastructure.ai.parsers.response_validator import ResponseValidator

from app.domain.entities.collector import CollectorResult
from app.presentation.api.schemas.llm_result import LLMResult
from app.presentation.api.schemas.evidence_result import EvidenceResult
from app.config.logger import logger


class AIAnalysisAgent:
    """
    AI Analysis Agent.

    Chỉ điều phối pipeline AI.

    Không chứa Prompt.

    Không chứa Gemini.

    Không chứa Parse.
    """

    def __init__(self):

        self.prompt_builder = PromptBuilder()

        self.llm_analyzer = LLMAnalyzer()

        self.parser = LLMParser()

        self.validator = ResponseValidator()

    def analyze(
        self,
        collector: CollectorResult,
        evidences: EvidenceResult,
    ) -> LLMResult:

        logger.info("=" * 80)

        logger.info("AI Analysis Agent")

        #
        # Build Prompt
        #

        prompt = self.prompt_builder.build(
            collector,
            evidences,
        )

        logger.info(
            f"Prompt Length : {len(prompt)}"
        )

        #
        # Gemini
        #

        response = self.llm_analyzer.analyze(
            prompt
        )

        logger.info(
            f"Response Length : {len(response)}"
        )

        #
        # Parse
        #

        result = self.parser.parse(
            response
        )

        #
        # Validate
        #

        result = self.validator.validate(
            result
        )

        #
        # Logging
        #

        logger.info(
            f"Status        : {result.status}"
        )

        logger.info(
            f"Risk Score    : {result.risk_score}"
        )

        logger.info(
            f"Level         : {result.level}"
        )

        logger.info(
            f"Confidence    : {result.confidence}"
        )

        logger.info(
            f"Categories    : {result.categories}"
        )

        logger.info(
            f"Indicators    : {result.indicators}"
        )

        logger.info(
            f"Reason        : {result.reason}"
        )

        logger.info("=" * 80)

        return result