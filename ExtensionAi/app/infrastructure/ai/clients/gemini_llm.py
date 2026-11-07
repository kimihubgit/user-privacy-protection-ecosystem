"""
Gemini LLM

Triển khai BaseLLM bằng Google Gemini.
"""

from __future__ import annotations

from google import genai

from google.genai import types

from app.infrastructure.ai.clients.base_llm import BaseLLM

from app.config.settings import GEMINI_API_KEY
from app.config.settings import GEMINI_MODEL

from app.config.logger import logger


class GeminiLLM(BaseLLM):
    """
    Gemini LLM Provider
    """

    # Timeout tính bằng milliseconds (theo SDK google-genai).
    # Trước đây KHÔNG có timeout -> nếu Gemini chậm/treo, cả request
    # (và cả worker thread xử lý nó) treo vô thời hạn.
    TIMEOUT_MS = 15_000

    # Chặn Gemini sinh output quá dài -> giới hạn thời gian sinh token,
    # vì độ trễ chủ yếu do số token OUTPUT phải sinh tuần tự.
    MAX_OUTPUT_TOKENS = 1024

    # Mặc định Gemini chặn khá gắt DANGEROUS_CONTENT/HARASSMENT ở mức
    # trung bình. Vì use case của app là MÔ TẢ hành vi lừa đảo (đánh
    # cắp mật khẩu, giả mạo brand, đe doạ...) để CẢNH BÁO người dùng —
    # không phải tạo nội dung độc hại — nội dung mô tả này dễ bị chặn
    # nhầm giữa chừng (response bị cắt cụt, không throw exception rõ
    # ràng, JSON output bị dở dang -> JSONDecodeError ở tầng Parser).
    # Nới ngưỡng lên BLOCK_ONLY_HIGH cho 2 category liên quan trực
    # tiếp; giữ nguyên mặc định cho các category không liên quan.
    SAFETY_SETTINGS = [
        types.SafetySetting(
            category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold=types.HarmBlockThreshold.BLOCK_ONLY_HIGH,
        ),
        types.SafetySetting(
            category=types.HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold=types.HarmBlockThreshold.BLOCK_ONLY_HIGH,
        ),
    ]

    def __init__(self) -> None:

        self.client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options=types.HttpOptions(
                timeout=self.TIMEOUT_MS
            ),
        )

        self.model = GEMINI_MODEL

    def generate(
        self,
        prompt: str
    ) -> str:
        """
        Sinh phản hồi từ Gemini.
        """

        response = self.client.models.generate_content(

            model=self.model,

            contents=prompt,

            config=types.GenerateContentConfig(
                max_output_tokens=self.MAX_OUTPUT_TOKENS,
                temperature=0,
                safety_settings=self.SAFETY_SETTINGS,
                # Gemini 2.5 bật "thinking" mặc định, và thinking token
                # bị TÍNH CHUNG vào max_output_tokens. Model có thể
                # dùng gần hết budget để "suy nghĩ" nội bộ (không hiển
                # thị), khiến JSON output thật bị cắt cụt giữa chừng —
                # đây chính là nguyên nhân lỗi JSONDecodeError gặp phải.
                # Tắt hẳn vì tác vụ này chỉ cần map evidence có sẵn
                # sang JSON, không cần suy luận nhiều bước; tắt thinking
                # còn giúp giảm thêm latency.
                thinking_config=types.ThinkingConfig(
                    thinking_budget=0,
                ),
            ),

        )

        self._log_finish_reason(response)

        if response.text:

            return response.text

        return ""

    @staticmethod
    def _log_finish_reason(response) -> None:
        """
        Log finish_reason/safety info để chẩn đoán khi response bị
        cắt cụt (JSON dở dang) — trước đây không có log này nên phải
        đoán nguyên nhân qua độ dài response ngắn bất thường.
        """

        candidates = getattr(response, "candidates", None) or []

        for candidate in candidates:

            finish_reason = getattr(
                candidate,
                "finish_reason",
                None,
            )

            if finish_reason and str(finish_reason) != "STOP":

                logger.warning(
                    f"Gemini finish_reason bất thường: {finish_reason}"
                )

                safety_ratings = getattr(
                    candidate,
                    "safety_ratings",
                    None,
                )

                if safety_ratings:

                    logger.warning(
                        f"Safety ratings: {safety_ratings}"
                    )