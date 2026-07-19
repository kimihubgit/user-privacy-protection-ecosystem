from dataclasses import dataclass, field
from datetime import datetime, UTC
from uuid import uuid4

from domain.entities.message import Message


@dataclass(slots=True)
class Conversation:
    """
    Lưu lịch sử hội thoại.
    """

    messages: list[Message] = field(default_factory=list)

    id: str = field(default_factory=lambda: str(uuid4()))

    created_at: datetime = field(
        default_factory=lambda: datetime.now(UTC)
    )

    def add(self, message: Message) -> None:
        self.messages.append(message)

    @property
    def last_message(self) -> Message | None:

        if not self.messages:
            return None

        return self.messages[-1]