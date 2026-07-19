from application.ports.llm_port import LLMPort

from domain.entities.intent import Intent

from infrastructure.parsers.intent_parser import IntentParser

from prompts.classify_prompt import CLASSIFY_PROMPT


class ClassifyIntentUseCase:

    def __init__(
        self,
        llm: LLMPort,
        parser: IntentParser,
    ):
        self._llm = llm
        self._parser = parser

    async def execute(
        self,
        message: str,
    ) -> Intent:

        response = await self._llm.generate(

            prompt=message,

            system_prompt=CLASSIFY_PROMPT,

            temperature=0,

        )

        return self._parser.parse(
            response.reply,
        )