from application.models.agent_context import AgentContext
from application.services.context_manager import ContextManager


class MemoryAgent:
    """
    Memory Agent chịu trách nhiệm lấy ngữ cảnh hội thoại.
    Không lưu dữ liệu, chỉ sử dụng ContextManager.
    """

    def __init__(
        self,
        context_manager: ContextManager,
    ):
        self._context_manager = context_manager

    async def load(
        self,
        context: AgentContext,
    ) -> AgentContext:
        """
        Trả về AgentContext đã có đầy đủ lịch sử hội thoại.
        """

        return context

    async def save(
        self,
        context: AgentContext,
        reply: str,
    ) -> None:
        """
        Commit đầu chưa cần implement.
        Việc lưu hội thoại vẫn do HandleChatMessageUseCase đảm nhiệm.
        """
        return