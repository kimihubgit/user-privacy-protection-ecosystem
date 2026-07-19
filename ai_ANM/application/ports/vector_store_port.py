"""
Vector Store Port

Interface cho mọi Vector Database.
"""

from abc import ABC, abstractmethod

from domain.entities.retrieved_document import (
    RetrievedDocument,
)


class VectorStorePort(ABC):
    """
    Interface của Vector Database.

    Có thể implement bằng:

    - Pinecone
    - Qdrant
    - Weaviate
    - FAISS
    - Chroma
    """

    @abstractmethod
    async def upsert(
        self,
        *,
        ids: list[str],
        vectors: list[list[float]],
        documents: list[str],
        metadata: list[dict],
        namespace: str,
    ) -> None:
        """
        Lưu vectors vào Vector Database.
        """
        raise NotImplementedError

    @abstractmethod
    async def search(
        self,
        *,
        vector: list[float],
        top_k: int,
        namespace: str,
    ) -> list[RetrievedDocument]:
        """
        Tìm kiếm các document gần nhất.
        """
        raise NotImplementedError

    @abstractmethod
    async def delete(
        self,
        *,
        ids: list[str],
        namespace: str,
    ) -> None:
        """
        Xóa document.
        """
        raise NotImplementedError