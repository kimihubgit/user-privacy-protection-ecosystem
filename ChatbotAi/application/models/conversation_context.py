"""
Conversation Context

Lưu trạng thái của một phiên hội thoại.
"""

from dataclasses import dataclass, field


@dataclass(slots=True)
class ConversationContext:
    """
    Context của một phiên chat.

    Sau này có thể lưu trong Redis hoặc Database.
    """

    session_id: str

    history: list[str] = field(default_factory=list)

    metadata: dict = field(default_factory=dict)

    def add_user_message(
        self,
        message: str,
    ) -> None:
        """
        Thêm tin nhắn của người dùng.
        """
        self.history.append(
            f"User: {message}"
        )

    def add_assistant_message(
        self,
        message: str,
    ) -> None:
        """
        Thêm phản hồi của AI.
        """
        self.history.append(
            f"Assistant: {message}"
        )

    def clear(self) -> None:
        """
        Xóa lịch sử hội thoại.
        """
        self.history.clear()
        self.metadata.clear()