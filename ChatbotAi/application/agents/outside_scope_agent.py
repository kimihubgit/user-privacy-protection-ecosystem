from application.models.outside_scope_result import (
    OutsideScopeResult,
)

from application.ports.llm_port import LLMPort

from application.prompts.outside_scope_prompt import (
    OUTSIDE_SCOPE_PROMPT,
)


class OutsideScopeAgent:

    def __init__(
        self,
        llm: LLMPort,
    ):
        self._llm = llm

    async def execute(
        self,
        *,
        question: str,
    ) -> OutsideScopeResult:

        prompt = OUTSIDE_SCOPE_PROMPT.format(
            question=question,
        )

        reply = await self._llm.generate_text(
            prompt=prompt,
        )

        return OutsideScopeResult(
            supported=False,
            message=reply,
        )