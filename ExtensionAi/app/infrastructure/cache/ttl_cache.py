"""
TTL Cache

Wrapper mỏng quanh cachetools.TTLCache (đã có sẵn trong requirements.txt)
để tránh tự viết lại logic TTL/eviction từ đầu.

cachetools.TTLCache tự xử lý:
- Hết hạn theo TTL
- Giới hạn kích thước (eviction theo LRU khi đầy)

Chỉ thêm threading.Lock vì cachetools không tự thread-safe.

Dùng để tránh chạy lại toàn bộ pipeline (OSINT + Collector + WHOIS +
Network + Gemini) cho cùng 1 URL vừa được phân tích gần đây.

Không chia sẻ giữa nhiều process/instance. Nếu scale ra nhiều worker
process hoặc nhiều máy, cần thay bằng Redis với cùng interface get/set.
"""

from __future__ import annotations

import threading
from typing import Any

from cachetools import TTLCache as _CachetoolsTTLCache


class TTLCache:

    def __init__(
        self,
        ttl_seconds: int = 1800,
        max_size: int = 500,
    ) -> None:

        self._cache: _CachetoolsTTLCache = _CachetoolsTTLCache(
            maxsize=max_size,
            ttl=ttl_seconds,
        )

        self._lock = threading.Lock()

    def get(self, key: str) -> Any | None:

        with self._lock:

            return self._cache.get(key)

    def set(self, key: str, value: Any) -> None:

        with self._lock:

            self._cache[key] = value