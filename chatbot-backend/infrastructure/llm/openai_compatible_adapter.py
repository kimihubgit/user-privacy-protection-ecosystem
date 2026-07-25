"""
OpenAI-Compatible Adapter

Adapter dùng chung cho mọi provider có API dạng OpenAI Chat Completions:
- LM Studio (chạy Qwen3 4B local / qua cloudflare tunnel)
- Groq

Chỉ khác nhau ở base_url, api_key, model.
"""

from __future__ import annotations

from typing import AsyncIterator

from openai import AsyncOpenAI

from application.builders.response_builder import ResponseBuilder
from application.ports.llm_port import LLMPort

from domain.entities.agent_response import AgentResponse

from observability.logger import logger
from observability import token_tracker


class OpenAICompatibleAdapter(LLMPort):

    def __init__(
        self,
        *,
        base_url: str,
        api_key: str,
        model: str,
        temperature: float = 0.3,
        max_tokens: int = 1024,
        provider_name: str = "openai-compatible",
        timeout: float = 30.0,
        agent_name: str | None = None,
    ):
        self._client = AsyncOpenAI(
            base_url=base_url,
            api_key=api_key or "not-needed",
            timeout=timeout,
        )

        self._model = model
        self._default_temperature = temperature
        self._max_tokens = max_tokens
        self._provider_name = provider_name
        self._agent_name = agent_name or provider_name

    def _record_usage(self, completion) -> None:
        """Đọc completion.usage (chuẩn OpenAI Chat Completions) và ghi
        vào token_tracker. Bọc try/except vì chỉ phục vụ observability."""

        try:
            usage = getattr(completion, "usage", None)

            if usage is None:
                return

            token_tracker.record(
                agent=self._agent_name,
                provider=self._provider_name,
                input_tokens=getattr(usage, "prompt_tokens", 0) or 0,
                output_tokens=getattr(usage, "completion_tokens", 0) or 0,
            )

        except Exception as ex:

            logger.warning(
                f"[{self._provider_name}] Không đọc được usage: {ex}",
            )

    def _build_messages(
        self,
        *,
        prompt: str,
        system_prompt: str | None,
    ) -> list[dict]:

        messages = []

        if system_prompt:
            messages.append(
                {"role": "system", "content": system_prompt},
            )

        messages.append(
            {"role": "user", "content": prompt},
        )

        return messages

    async def generate(
        self,
        *,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.3,
    ) -> AgentResponse:

        try:

            completion = await self._client.chat.completions.create(
                model=self._model,
                messages=self._build_messages(
                    prompt=prompt,
                    system_prompt=system_prompt,
                ),
                temperature=temperature,
                max_tokens=self._max_tokens,
            )

            text = completion.choices[0].message.content or ""

            self._record_usage(completion)

            return ResponseBuilder.success(reply=text)

        except Exception as ex:

            logger.warning(
                f"[{self._provider_name}] generate() lỗi: {ex}",
            )

            return ResponseBuilder.error(
                message=f"{self._provider_name} Error: {ex}",
            )

    async def generate_stream(
        self,
        *,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.3,
    ) -> AsyncIterator[str]:

        try:

            stream = await self._client.chat.completions.create(
                model=self._model,
                messages=self._build_messages(
                    prompt=prompt,
                    system_prompt=system_prompt,
                ),
                temperature=temperature,
                max_tokens=self._max_tokens,
                stream=True,
            )

            async for chunk in stream:

                delta = chunk.choices[0].delta

                text = getattr(delta, "content", None)

                if text:
                    yield text

        except Exception as ex:

            logger.warning(
                f"[{self._provider_name}] generate_stream() lỗi: {ex}",
            )

            yield f"\n\n[Lỗi khi sinh câu trả lời ({self._provider_name}): {ex}]"

    async def generate_text(
        self,
        *,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.3,
    ) -> str:
        """
        Sinh raw text. Không nuốt exception ở đây — để cho
        FallbackLLMAdapter (nếu có bọc ngoài) quyết định có
        chuyển sang provider dự phòng hay không.
        """

        completion = await self._client.chat.completions.create(
            model=self._model,
            messages=self._build_messages(
                prompt=prompt,
                system_prompt=system_prompt,
            ),
            temperature=temperature,
            max_tokens=self._max_tokens,
        )

        self._record_usage(completion)

        return completion.choices[0].message.content or ""