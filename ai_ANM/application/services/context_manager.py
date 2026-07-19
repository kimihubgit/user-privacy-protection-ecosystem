"""
Context Manager

Quản lý ConversationContext và tạo AgentContext.
"""

from application.models.agent_context import AgentContext
from application.models.conversation_context import (
    ConversationContext,
)


class ContextManager:
    """
    Chuyển ConversationContext thành AgentContext.
    """

    def build(
        self,
        *,
        conversation: ConversationContext,
        message: str,
    ) -> AgentContext:
        """
        Tạo AgentContext cho Agent.
        """

        return AgentContext(
            message=message,
            history=list(conversation.history),
            retrieved_docs=[],
            metadata=dict(conversation.metadata),
        )

    def add_user_message(
        self,
        *,
        conversation: ConversationContext,
        message: str,
    ) -> None:
        """
        Lưu tin nhắn người dùng.
        """

        conversation.add_user_message(message)

    def add_assistant_message(
        self,
        *,
        conversation: ConversationContext,
        message: str,
    ) -> None:
        """
        Lưu phản hồi AI.
        """

        conversation.add_assistant_message(message)

    def clear(
        self,
        *,
        conversation: ConversationContext,
    ) -> None:
        """
        Xóa context.
        """

        conversation.clear()