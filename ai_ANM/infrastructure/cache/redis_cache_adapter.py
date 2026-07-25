"""
Redis Cache Adapter

Triển khai CachePort bằng Redis. Dùng để cache kết quả Retrieval
(Pinecone + Embedding) và Web Search (Tavily) — đây là những bước
tốn tiền (API trả phí) và tốn thời gian (network round-trip) nhất
trong pipeline, nên cache theo query là nơi tối ưu tốc độ + chi phí
hiệu quả nhất.

Nếu Redis không kết nối được (chưa bật, sai URL...), adapter sẽ
"fail-open": coi như cache miss / bỏ qua set, KHÔNG làm crash chatbot.

Circuit breaker đơn giản: sau 1 lần lỗi kết nối, tạm "tắt" cache
trong `_COOLDOWN_SECONDS` để không thử kết nối lại (và spam log)
ở mỗi request tiếp theo, cho tới khi hết cooldown mới thử lại.
"""

from __future__ import annotations

import json
import time
from typing import Any

import redis.asyncio as redis

from application.ports.cache_port import CachePort

from observability.logger import logger


_COOLDOWN_SECONDS = 30


class RedisCacheAdapter(CachePort):

    def __init__(
        self,
        *,
        redis_url: str,
        db: int = 0,
    ):
        self._client = redis.from_url(
            redis_url,
            db=db,
            decode_responses=True,
            socket_connect_timeout=1,
            socket_timeout=1,
        )

        # Nếu > lúc này -> đang trong thời gian "tắt" cache do lỗi
        # kết nối gần nhất, bỏ qua luôn không thử Redis nữa.
        self._unavailable_until: float = 0.0
        self._warned = False

    def _skip(self) -> bool:
        return time.monotonic() < self._unavailable_until

    def _mark_failure(self, ex: Exception, op: str, key: str) -> None:

        self._unavailable_until = time.monotonic() + _COOLDOWN_SECONDS

        if not self._warned:

            logger.warning(
                f"[redis-cache] Không kết nối được Redis (thao tác "
                f"{op}, key={key!r}): {ex}. Tạm tắt cache trong "
                f"{_COOLDOWN_SECONDS}s, chatbot vẫn chạy bình thường "
                f"(chỉ là không cache).",
            )

            self._warned = True

    def _mark_recovered(self) -> None:

        if self._warned:

            logger.info(
                "[redis-cache] Kết nối Redis lại được, bật cache trở lại.",
            )

        self._unavailable_until = 0.0
        self._warned = False

    async def get(
        self,
        key: str,
    ) -> Any:

        if self._skip():
            return None

        try:

            raw = await self._client.get(key)

            self._mark_recovered()

        except Exception as ex:

            self._mark_failure(ex, "get", key)

            return None

        if raw is None:
            return None

        try:

            return json.loads(raw)

        except (TypeError, ValueError):

            return None

    async def set(
        self,
        key: str,
        value: Any,
        ttl: int,
    ) -> None:

        if self._skip():
            return

        try:

            await self._client.set(
                key,
                json.dumps(value, ensure_ascii=False),
                ex=ttl,
            )

            self._mark_recovered()

        except Exception as ex:

            self._mark_failure(ex, "set", key)
