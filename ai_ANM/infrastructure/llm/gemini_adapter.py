"""
Gemini Adapter

Google Gemini implementation của LLMPort.
"""

from __future__ import annotations

import asyncio

from google import genai
from google.genai.types import GenerateContentConfig

from application.builders.response_builder import (
    ResponseBuilder,
)
from application.ports.llm_port import (
    LLMPort,
)

from config.settings import settings

from domain.entities.agent_response import (
    AgentResponse,
)


class GeminiAdapter(LLMPort):

    def __init__(self):

        self._client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )

        self._model = settings.GEMINI_MODEL

    async def generate(
        self,
        *,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.3,
    ) -> AgentResponse:

        try:

            response = await asyncio.to_thread(

                self._client.models.generate_content,

                model=self._model,

                contents=prompt,

                config=GenerateContentConfig(

                    system_instruction=system_prompt,

                    temperature=temperature,

                ),
            )

            text = response.text or ""

            return ResponseBuilder.success(
                reply=text,
            )

        except Exception as ex:

            return ResponseBuilder.error(
                message=f"Gemini Error: {ex}",
            )