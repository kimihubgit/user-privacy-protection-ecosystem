"""
Fallback LLM Adapter

Bọc 1 provider chính (Local Qwen3, Groq...) và 1 provider dự phòng
(mặc định: Gemini). Nếu provider chính lỗi (raise exception, timeout,
API key sai, server local/groq sập, rate limit...) hoặc trả về
AgentResponse.success=False, tự động chuyển sang provider dự phòng.
"""

from __future__ import annotations

from typing import AsyncIterator

from application.builders.response_builder import ResponseBuilder
from application.ports.llm_port import LLMPort

from domain.entities.agent_response import AgentResponse

from observability.logger import logger


class FallbackLLMAdapter(LLMPort):

    def __init__(
        self,
        *,
        primary: LLMPort,
        fallback: LLMPort,
        primary_name: str = "primary",
        fallback_name: str = "gemini",
    ):
        self._primary = primary
        self._fallback = fallback
        self._primary_name = primary_name
        self._fallback_name = fallback_name

    async def generate(
        self,
        *,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.3,
    ) -> AgentResponse:

        try:

            result = await self._primary.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=temperature,
            )

            if result.success and result.reply:
                return result

            logger.warning(
                f"[Fallback] {self._primary_name} trả lỗi/rỗng "
                f"-> chuyển sang {self._fallback_name}. "
                f"Chi tiết: {result.reply!r}",
            )

        except Exception as ex:

            logger.warning(
                f"[Fallback] {self._primary_name} raise exception "
                f"-> chuyển sang {self._fallback_name}. Lỗi: {ex}",
            )

        try:

            return await self._fallback.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=temperature,
            )

        except Exception as ex:

            logger.error(
                f"[Fallback] {self._fallback_name} cũng lỗi: {ex}",
            )

            return ResponseBuilder.error(
                message=(
                    f"Cả {self._primary_name} lẫn "
                    f"{self._fallback_name} đều lỗi: {ex}"
                ),
            )

    async def generate_stream(
        self,
        *,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.3,
    ) -> AsyncIterator[str]:
        """
        Với streaming: thử stream từ primary; nếu chunk đầu tiên
        không sinh ra được nội dung nào (lỗi ngay từ đầu), chuyển
        sang fallback. Nếu lỗi xảy ra giữa chừng sau khi đã stream
        được vài đoạn, không thể "undo" những gì đã gửi cho client
        nên chỉ log + dừng (giữ nguyên hành vi cũ của GeminiAdapter).
        """

        got_any_chunk = False

        try:

            async for chunk in self._primary.generate_stream(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=temperature,
            ):
                got_any_chunk = True
                yield chunk

            if got_any_chunk:
                return

        except Exception as ex:

            logger.warning(
                f"[Fallback] {self._primary_name} stream lỗi trước "
                f"khi sinh chunk nào -> chuyển sang "
                f"{self._fallback_name}. Lỗi: {ex}",
            )

        if got_any_chunk:
            # Đã stream được ít nhất 1 phần từ primary rồi mới lỗi
            # -> không fallback nữa để tránh lặp/nội dung không nhất quán.
            return

        logger.warning(
            f"[Fallback] {self._primary_name} không sinh được chunk "
            f"nào -> chuyển sang {self._fallback_name}.",
        )

        async for chunk in self._fallback.generate_stream(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
        ):
            yield chunk

    async def generate_text(
        self,
        *,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.3,
    ) -> str:

        try:

            text = await self._primary.generate_text(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=temperature,
            )

            if text and text.strip():
                return text

            logger.warning(
                f"[Fallback] {self._primary_name} trả về rỗng "
                f"-> chuyển sang {self._fallback_name}.",
            )

        except Exception as ex:

            logger.warning(
                f"[Fallback] {self._primary_name} raise exception "
                f"(generate_text) -> chuyển sang {self._fallback_name}. "
                f"Lỗi: {ex}",
            )

        return await self._fallback.generate_text(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
        )
