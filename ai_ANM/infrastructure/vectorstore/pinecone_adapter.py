"""
Pinecone Adapter

Implement VectorStorePort.
"""

from __future__ import annotations

import asyncio
import time

from pinecone import Pinecone

from application.ports.vector_store_port import (
    VectorStorePort,
)

from config.settings import settings

from domain.entities.retrieved_document import (
    RetrievedDocument,
)

from observability.logger import logger


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

        started_at = time.perf_counter()

        result = await asyncio.to_thread(
            self._index.query,
            vector=vector,
            top_k=top_k,
            include_metadata=True,
            namespace=namespace,
        )

        elapsed_ms = (time.perf_counter() - started_at) * 1000

        logger.info(
            f"[pinecone] query namespace={namespace!r} top_k={top_k} "
            f"elapsed={elapsed_ms:.1f}ms matches={len(result.matches)}",
        )

        documents = []

        for match in result.matches:

            metadata = match.metadata or {}

            content = (
                metadata.get("content")
                or metadata.get("text")
                or ""
            )

            source = (
                metadata.get("source")
                or metadata.get("ten_van_ban")
                or metadata.get("source_file")
                or ""
            )

            documents.append(
                RetrievedDocument(
                    id=match.id,
                    content=content,
                    source=source,
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