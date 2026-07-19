"""
Pinecone Adapter

Implement VectorStorePort.
"""

from __future__ import annotations

import asyncio

from pinecone import Pinecone

from application.ports.vector_store_port import (
    VectorStorePort,
)

from config.settings import settings

from domain.entities.retrieved_document import (
    RetrievedDocument,
)


class PineconeAdapter(VectorStorePort):

    def __init__(self):

        self._client = Pinecone(
            api_key=settings.PINECONE_API_KEY,
        )

        self._index = self._client.Index(
            settings.PINECONE_INDEX,
        )

    async def upsert(
        self,
        *,
        ids: list[str],
        vectors: list[list[float]],
        documents: list[str],
        metadata: list[dict],
        namespace: str,
    ) -> None:

        payload = []

        for id_, vector, document, meta in zip(
            ids,
            vectors,
            documents,
            metadata,
        ):

            payload.append(
                {
                    "id": id_,
                    "values": vector,
                    "metadata": {
                        **meta,
                        "content": document,
                    },
                }
            )

        await asyncio.to_thread(
            self._index.upsert,
            vectors=payload,
            namespace=namespace,
        )

    async def search(
        self,
        *,
        vector: list[float],
        top_k: int,
        namespace: str,
    ) -> list[RetrievedDocument]:

        result = await asyncio.to_thread(
            self._index.query,
            vector=vector,
            top_k=top_k,
            include_metadata=True,
            namespace=namespace,
        )

        documents = []

        for match in result.matches:

            metadata = match.metadata or {}

            content = (
                metadata.get("content")
                or metadata.get("text")
                or ""
            )

            documents.append(
                RetrievedDocument(
                    id=match.id,
                    content=content,
                    source=metadata.get(
                        "source",
                        "",
                    ),
                    score=match.score,
                    metadata=metadata,
                )
            )

        return documents

    async def delete(
        self,
        *,
        ids: list[str],
        namespace: str,
    ) -> None:

        await asyncio.to_thread(
            self._index.delete,
            ids=ids,
            namespace=namespace,
        )