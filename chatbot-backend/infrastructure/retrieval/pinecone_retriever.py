"""
Pinecone Retriever

Triển khai RetrieverPort.
"""

from application.ports.embedding_port import EmbeddingPort
from application.ports.retriever_port import RetrieverPort
from application.ports.vector_store_port import VectorStorePort

from domain.entities.retrieved_document import RetrievedDocument


class PineconeRetriever(RetrieverPort):

    def __init__(
        self,
        embedding: EmbeddingPort,
        vector_store: VectorStorePort,
    ):
        self._embedding = embedding
        self._vector_store = vector_store

    async def retrieve(
        self,
        *,
        query: str,
        top_k: int,
        namespace: str,
    ) -> list[RetrievedDocument]:

        vector = await self._embedding.embed(
            text=query,
        )

        return await self._vector_store.search(
            vector=vector,
            top_k=top_k,
            namespace=namespace,
        )