from application.builders.context_builder import ContextBuilder

from application.models.evidence import Evidence
from application.models.evaluation_result import (
    EvaluationResult,
)

from application.ports.llm_port import LLMPort

from infrastructure.parsers.evaluation_parser import (
    EvaluationParser,
)

from application.prompts.evaluation_prompt import (
    EVALUATION_PROMPT,
)


class EvaluationAgent:

    def __init__(
        self,
        llm: LLMPort,
        parser: EvaluationParser,
    ):
        self._llm = llm
        self._parser = parser

    async def evaluate(
        self,
        *,
        question: str,
        evidence: Evidence,
    ) -> EvaluationResult:

        context_text = ContextBuilder.build_context(
            evidence,
        )

        prompt = EVALUATION_PROMPT.format(

            question=question,

            evidence=context_text,

        )

        response = await self._llm.generate_text(
            prompt=prompt,
        )

        return self._parser.parse(
            response,
        )