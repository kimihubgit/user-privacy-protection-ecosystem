from abc import ABC, abstractmethod

from domain.entities.conversation import Conversation


class ConversationRepositoryPort(ABC):

    @abstractmethod
    async def load(
        self,
        conversation_id: str,
    ) -> Conversation | None:
        raise NotImplementedError

    @abstractmethod
    async def save(
        self,
        conversation: Conversation,
    ) -> None:
        raise NotImplementedError