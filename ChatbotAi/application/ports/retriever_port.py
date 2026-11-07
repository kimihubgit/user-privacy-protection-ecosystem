from abc import ABC, abstractmethod

from domain.entities.retrieved_document import RetrievedDocument


class RetrieverPort(ABC):

    @abstractmethod
    async def retrieve(
        self,
        *,
        query: str,
        top_k: int,
        namespace: str,
    ) -> list[RetrievedDocument]:
        raise NotImplementedError