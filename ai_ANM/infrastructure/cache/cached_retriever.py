"""
Cached Retriever

Bọc 1 RetrieverPort bất kỳ (vd: PineconeRetriever) để cache kết quả
theo (namespace, query) trong Redis. Cache HIT -> bỏ qua luôn cả bước
Embedding (Gemini) lẫn Pinecone search -> nhanh hơn nhiều và không
tốn thêm phí embedding/Pinecone cho các câu hỏi lặp lại hoặc phổ biến
(vốn rất hay gặp ở chatbot chống lừa đảo, ví dụ "app abc có lừa đảo
không", "số điện thoại này có phải lừa đảo không"...).
"""

from __future__ import annotations

import hashlib
import time

from application.ports.cache_port import CachePort
from application.ports.retriever_port import RetrieverPort

from domain.entities.retrieved_document import RetrievedDocument

from observability.logger import logger


def _cache_key(namespace: str, query: str) -> str:

    query_hash = hashlib.sha256(
        query.strip().lower().encode("utf-8"),
    ).hexdigest()

    return f"retrieval:{namespace}:{query_hash}"


class CachedRetriever(RetrieverPort):

    def __init__(
        self,
        *,
        retriever: RetrieverPort,
        cache: CachePort,
        ttl: int,
    ):
        self._retriever = retriever
        self._cache = cache
        self._ttl = ttl

    async def retrieve(
        self,
        *,
        query: str,
        top_k: int,
        namespace: str,
    ) -> list[RetrievedDocument]:

        key = _cache_key(namespace, query)

        cached = await self._cache.get(key)

        if cached is not None:

            logger.info(
                f"[cache] HIT retrieval ({namespace}): {query[:60]!r}",
            )

            return [
                RetrievedDocument(**doc)
                for doc in cached
            ]

        started_at = time.perf_counter()

        documents = await self._retriever.retrieve(
            query=query,
            top_k=top_k,
            namespace=namespace,
        )

        elapsed_ms = (time.perf_counter() - started_at) * 1000

        logger.info(
            f"[query] retrieval MISS ({namespace}) "
            f"top_k={top_k} elapsed={elapsed_ms:.1f}ms "
            f"hits={len(documents)} query={query[:120]!r}",
        )

        if documents:

            await self._cache.set(
                key,
                [
                    {
                        "id": d.id,
                        "content": d.content,
                        "source": d.source,
                        "score": d.score,
                        "metadata": d.metadata,
                    }
                    for d in documents
                ],
                self._ttl,
            )

        return documents
