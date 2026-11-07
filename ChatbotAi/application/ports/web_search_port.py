from abc import ABC, abstractmethod

from domain.entities.retrieved_document import RetrievedDocument


class WebSearchPort(ABC):

    @abstractmethod
    async def search(
        self,
        *,
        query: str,
    ) -> list[RetrievedDocument]:
        ...