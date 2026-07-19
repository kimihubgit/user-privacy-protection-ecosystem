"""
LLM Port

Định nghĩa interface cho mọi Large Language Model.

Mọi adapter (Gemini, Claude, OpenAI...)
đều phải implement interface này.
"""

from abc import ABC, abstractmethod

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