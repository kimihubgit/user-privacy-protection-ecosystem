from abc import ABC

from application.builders.prompt_builder import PromptBuilder
from application.models.agent_context import AgentContext
from application.ports.llm_port import LLMPort

from domain.entities.agent_response import AgentResponse


class BaseAgent(ABC):

    SYSTEM_PROMPT = ""

    TEMPERATURE = 0.3

    def __init__(
        self,
        llm: LLMPort,
    ):
        self._llm = llm

    async def run(
        self,
        context: AgentContext,
    ) -> AgentResponse:

        prompt = PromptBuilder.build(
            context=context,
        )

        return await self._llm.generate(
            prompt=prompt,
            system_prompt=self.SYSTEM_PROMPT,
            temperature=self.TEMPERATURE,
        )