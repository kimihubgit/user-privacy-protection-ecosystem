"""
Cached Web Search

Bọc 1 WebSearchPort (Tavily) để cache kết quả theo query trong Redis.
Tavily tính phí theo mỗi lần gọi -> cache HIT giúp giảm thẳng chi phí
này, đồng thời nhanh hơn hẳn so với việc gọi lại API mỗi lần.
"""

from __future__ import annotations

import hashlib
import time

from application.ports.cache_port import CachePort
from application.ports.web_search_port import WebSearchPort

from domain.entities.retrieved_document import RetrievedDocument

from observability.logger import logger


def _cache_key(query: str) -> str:

    query_hash = hashlib.sha256(
        query.strip().lower().encode("utf-8"),
    ).hexdigest()

    return f"websearch:{query_hash}"


class CachedWebSearch(WebSearchPort):

    def __init__(
        self,
        *,
        search: WebSearchPort,
        cache: CachePort,
        ttl: int,
    ):
        self._search = search
        self._cache = cache
        self._ttl = ttl

    async def search(
        self,
        *,
        query: str,
    ) -> list[RetrievedDocument]:

        key = _cache_key(query)

        cached = await self._cache.get(key)

        if cached is not None:

            logger.debug(
                f"[cache] HIT web_search: {query[:60]!r}",
            )

            return [
                RetrievedDocument(**doc)
                for doc in cached
            ]

        started_at = time.perf_counter()

        documents = await self._search.search(
            query=query,
        )

        elapsed_ms = (time.perf_counter() - started_at) * 1000

        logger.debug(
            f"[query] web_search MISS elapsed={elapsed_ms:.1f}ms "
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
                # Web search nên cache ngắn hơn Retrieval nội bộ vì
                # thông tin trên Internet thay đổi nhanh hơn.
                min(self._ttl, 1800),
            )

        return documents
