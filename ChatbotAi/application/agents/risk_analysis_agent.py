from application.models.evidence import Evidence
from application.models.risk_result import RiskResult

from application.prompts.risk_prompt import RISK_PROMPT

from infrastructure.llm.gemini_adapter import GeminiAdapter

from infrastructure.parsers.risk_parser import RiskParser


class RiskAnalysisAgent:

    def __init__(

        self,

        llm: GeminiAdapter,

        parser: RiskParser,

    ):

        self._llm = llm

        self._parser = parser

    async def analyze(

        self,

        *,

        question: str,

        evidence: Evidence,

    ) -> RiskResult:

        prompt = RISK_PROMPT.format(

            question=question,

            evidence=evidence,

        )

        response = await self._llm.generate_text(

            prompt=prompt,

        )

        return self._parser.parse(
            response,
        )