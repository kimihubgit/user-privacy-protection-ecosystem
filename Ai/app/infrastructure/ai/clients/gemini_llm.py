"""
Gemini LLM

Triển khai BaseLLM bằng Google Gemini.
"""

from __future__ import annotations

from google import genai

from app.infrastructure.ai.clients.base_llm import BaseLLM
from app.config.settings import GEMINI_API_KEY
from app.config.settings import GEMINI_MODEL


class GeminiLLM(BaseLLM):
    """
    Gemini LLM Provider
    """

    def __init__(self) -> None:

        self.client = genai.Client(api_key=GEMINI_API_KEY)

        self.model = GEMINI_MODEL

    def generate(self, prompt: str) -> str:
        """
        Sinh phản hồi từ Gemini.
        """

        response = self.client.models.generate_content(
            model=self.model, contents=prompt
        )

        if response.text:

            return response.text

        return ""
