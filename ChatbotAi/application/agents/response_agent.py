from application.builders.context_builder import ContextBuilder

from application.models.agent_context import AgentContext
from application.models.evidence import Evidence
from application.models.llm_result import LLMResult
from application.models.risk_result import RiskResult

from application.ports.llm_port import LLMPort

from application.prompts.response.law_response_prompt import (
    LAW_RESPONSE_PROMPT,
)
from application.prompts.response.scam_response_prompt import (
    SCAM_RESPONSE_PROMPT,
)
from application.prompts.response.url_response_prompt import (
    URL_RESPONSE_PROMPT,
)


class ResponseAgent:

    def __init__(
        self,
        llm: LLMPort,
    ):
        self._llm = llm

    async def generate(
        self,
        *,
        context: AgentContext,
        evidence: Evidence,
        risk: RiskResult,
        intent: str,
    ) -> LLMResult:

        context_text = ContextBuilder.build_context(
            evidence,
        )

        sources = ContextBuilder.build_sources(
            evidence,
        )

        # Chọn Prompt template theo Intent
        if intent == "cyber_law":
            prompt_template = LAW_RESPONSE_PROMPT
        elif intent == "scam_knowledge":
            prompt_template = SCAM_RESPONSE_PROMPT
        elif intent == "url_check":
            prompt_template = URL_RESPONSE_PROMPT
        else:
            prompt_template = SCAM_RESPONSE_PROMPT

        # Build Prompt
        prompt = prompt_template.format(

            question=context.message,

            evidence=context_text,

            risk_level=risk.risk_level,

            risk_score=risk.score,

            confidence=risk.confidence,

            reasons="\n".join(risk.reasons),
            
            sources=sources,

        )

        reply = await self._llm.generate_text(
            prompt=prompt,
        )

        return LLMResult(
            success=True,
            reply=reply,
        )