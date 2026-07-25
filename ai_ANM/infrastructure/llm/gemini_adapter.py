"""
Gemini Adapter

Google Gemini implementation của LLMPort.
"""

from __future__ import annotations

import asyncio
from typing import AsyncIterator

from google import genai
from google.genai.types import GenerateContentConfig, ThinkingConfig

from tenacity import (
    retry,
    retry_if_exception,
    stop_after_attempt,
    wait_exponential,
)

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

from observability.logger import logger
from observability import token_tracker


_TRANSIENT_MARKERS = (
    "503",
    "UNAVAILABLE",
    "429",
    "RESOURCE_EXHAUSTED",
    "overloaded",
    "high demand",
    "Deadline Exceeded",
    "DEADLINE_EXCEEDED",
)


def _is_transient_gemini_error(exception: BaseException) -> bool:
    """
    Chỉ retry với các lỗi tạm thời (server quá tải, rate limit,
    timeout...). Lỗi do cấu hình sai (API key sai, model không tồn
    tại...) sẽ không retry để tránh tốn thời gian vô ích.
    """

    message = str(exception)

    return any(
        marker in message
        for marker in _TRANSIENT_MARKERS
    )


# Retry tối đa 3 lần, chờ tăng dần (1s -> 2s -> 4s, tối đa 8s) trước
# khi coi là lỗi thật sự (để FallbackLLMAdapter hoặc caller xử lý tiếp).
_gemini_retry = retry(
    retry=retry_if_exception(_is_transient_gemini_error),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    reraise=True,
)


class GeminiAdapter(LLMPort):

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        max_output_tokens: int = 1024,
        thinking_budget: int = 0,
        agent_name: str = "gemini",
    ):
        """
        Parameters
        ----------
        api_key:
            API Key Gemini riêng cho instance này (ví dụ: dùng riêng cho
            1 Agent cụ thể). Nếu không truyền (None) hoặc truyền chuỗi
            rỗng, sẽ fallback về `settings.GEMINI_API_KEY` mặc định.

        model:
            Cho phép override model riêng nếu cần, mặc định dùng
            `settings.GEMINI_MODEL`.

        max_output_tokens:
            Giới hạn token sinh ra. Trước đây không giới hạn -> tốn
            tiền/thời gian không cần thiết cho các Agent chỉ cần trả
            JSON/1 câu ngắn (Planner, Evaluation, QueryRewrite,
            AnswerValidation). Response/RiskAnalysis nên dùng giá trị
            lớn hơn (truyền riêng khi khởi tạo).

        thinking_budget:
            Với các model Gemini có "thinking" (vd: gemini-3-*), token
            suy nghĩ ngầm (thinking tokens) bị TÍNH CHUNG vào
            max_output_tokens. Nếu không tắt, các Agent giới hạn token
            thấp (Planner/Evaluation/QueryRewrite/AnswerValidation) sẽ
            bị cắt cụt câu trả lời cuối cùng giữa chừng vì phần thinking
            đã ăn hết ngân sách token. Mặc định = 0 (tắt hẳn thinking)
            vì các Agent này chỉ cần trả JSON/1 câu ngắn, không cần suy
            luận sâu. Có thể truyền giá trị khác (vd: -1 = automatic)
            cho các Agent cần chất lượng suy luận cao hơn.
        """

        self._client = genai.Client(
            api_key=api_key or settings.GEMINI_API_KEY,
        )

        self._max_output_tokens = max_output_tokens

        self._model = model or settings.GEMINI_MODEL

        self._thinking_budget = thinking_budget

        self._agent_name = agent_name

    def _record_usage(self, response) -> None:
        """
        Đọc số token input/output từ `usage_metadata` của response
        Gemini (nếu SDK trả về) và ghi vào token_tracker. Bọc try/except
        vì đây chỉ là observability, không được phép làm hỏng luồng
        chính nếu SDK đổi field/không có usage_metadata.
        """

        try:
            usage = getattr(response, "usage_metadata", None)

            if usage is None:
                return

            token_tracker.record(
                agent=self._agent_name,
                provider="gemini",
                input_tokens=getattr(usage, "prompt_token_count", 0) or 0,
                output_tokens=getattr(usage, "candidates_token_count", 0) or 0,
            )

        except Exception as ex:

            logger.warning(
                f"[gemini] Không đọc được usage_metadata: {ex}",
            )

    def _build_config(
        self,
        *,
        system_prompt: str | None,
        temperature: float,
    ) -> GenerateContentConfig:

        return GenerateContentConfig(

            system_instruction=system_prompt,

            temperature=temperature,

            max_output_tokens=self._max_output_tokens,

            thinking_config=ThinkingConfig(
                thinking_budget=self._thinking_budget,
            ),
        )

    @_gemini_retry
    async def _call_generate_content(
        self,
        *,
        prompt: str,
        system_prompt: str | None,
        temperature: float,
    ):

        return await asyncio.to_thread(

            self._client.models.generate_content,

            model=self._model,

            contents=prompt,

            config=self._build_config(
                system_prompt=system_prompt,
                temperature=temperature,
            ),
        )

    async def generate(
        self,
        *,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.3,
    ) -> AgentResponse:

        try:

            response = await self._call_generate_content(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=temperature,
            )

            text = response.text or ""

            self._record_usage(response)

            return ResponseBuilder.success(
                reply=text,
            )

        except Exception as ex:

            logger.warning(
                f"[gemini] generate() lỗi sau khi retry: {ex}",
            )

            return ResponseBuilder.error(
                message=f"Gemini Error: {ex}",
            )

    async def generate_stream(
        self,
        *,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.3,
    ) -> AsyncIterator[str]:
        """
        Sinh câu trả lời theo dạng streaming, dùng client bất đồng bộ
        (client.aio) của SDK google-genai để không chặn event loop.

        Nếu lỗi tạm thời (503/429...) xảy ra TRƯỚC KHI có chunk nào
        được sinh ra, sẽ retry. Nếu lỗi xảy ra giữa chừng (đã stream
        được 1 phần), không retry nữa (tránh lặp/nội dung không nhất
        quán) — yield 1 thông báo lỗi thân thiện rồi dừng.
        """

        for attempt in range(3):

            got_any_chunk = False

            try:

                stream = await self._client.aio.models.generate_content_stream(

                    model=self._model,

                    contents=prompt,

                    config=self._build_config(
                        system_prompt=system_prompt,
                        temperature=temperature,
                    ),
                )

                async for chunk in stream:

                    text = getattr(chunk, "text", None)

                    if text:
                        got_any_chunk = True
                        yield text

                return

            except Exception as ex:

                if got_any_chunk or not _is_transient_gemini_error(ex):

                    yield f"\n\n[Lỗi khi sinh câu trả lời: {ex}]"

                    return

                logger.warning(
                    f"[gemini] generate_stream() lỗi tạm thời "
                    f"(lần {attempt + 1}/3), đang thử lại: {ex}",
                )

                await asyncio.sleep(min(2 ** attempt, 8))

        yield "\n\n[Lỗi khi sinh câu trả lời: Gemini đang quá tải, vui lòng thử lại sau.]"

    async def generate_text(
        self,
        *,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.3,
    ) -> str:

        response = await self._call_generate_content(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
        )

        self._record_usage(response)

        return response.text or ""