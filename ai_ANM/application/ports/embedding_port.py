"""
Embedding Port

Interface cho mọi Embedding Model.
"""

from abc import ABC, abstractmethod


class EmbeddingPort(ABC):
    """
    Interface của tầng Embedding.

    Có thể implement bằng:
    - Gemini Embedding
    - E5
    - BGE
    - OpenAI Embedding
    """

    @abstractmethod
    async def embed(
        self,
        *,
        text: str,
    ) -> list[float]:
        """
        Sinh embedding cho một đoạn văn.

        Parameters
        ----------
        text:
            Nội dung cần embedding.

        Returns
        -------
        list[float]
            Vector embedding.
        """
        raise NotImplementedError

    @abstractmethod
    async def embed_batch(
        self,
        *,
        texts: list[str],
    ) -> list[list[float]]:
        """
        Sinh embedding cho nhiều đoạn văn.

        Parameters
        ----------
        texts:
            Danh sách văn bản.

        Returns
        -------
        list[list[float]]
        """
        raise NotImplementedError