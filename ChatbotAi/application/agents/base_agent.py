from abc import ABC
from typing import AsyncIterator

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

    def stream_run(
        self,
        context: AgentContext,
    ) -> AsyncIterator[str]:
        """
        Giống run(), nhưng trả lời theo dạng streaming (từng đoạn text).
        """

        prompt = PromptBuilder.build(
            context=context,
        )

        return self._llm.generate_stream(
            prompt=prompt,
            system_prompt=self.SYSTEM_PROMPT,
            temperature=self.TEMPERATURE,
        )