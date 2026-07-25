"""
LLM Port

Định nghĩa interface cho mọi Large Language Model.

Mọi adapter (Gemini, Claude, OpenAI...)
đều phải implement interface này.
"""

from abc import ABC, abstractmethod
from typing import AsyncIterator

from domain.entities.agent_response import AgentResponse


class LLMPort(ABC):
    """
    Interface cho mọi Large Language Model.
    """

    @abstractmethod
    async def generate(
        self,
        *,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.3,
    ) -> AgentResponse:
        """
        Sinh câu trả lời từ LLM.

        Parameters
        ----------
        prompt:
            Nội dung người dùng.

        system_prompt:
            Prompt hệ thống.

        temperature:
            Nhiệt độ sinh văn bản.

        Returns
        -------
        AgentResponse
        """
        raise NotImplementedError

    @abstractmethod
    def generate_stream(
        self,
        *,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.3,
    ) -> AsyncIterator[str]:
        """
        Sinh câu trả lời từ LLM theo dạng streaming (từng đoạn text).
        """
        raise NotImplementedError

    @abstractmethod
    async def generate_text(
        self,
        *,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.3,
    ) -> str:
        """
        Sinh raw text từ LLM.

        Dùng cho Planner, Evaluation, Query Rewrite...
        """
        raise NotImplementedError