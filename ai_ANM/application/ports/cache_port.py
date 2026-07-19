from abc import ABC, abstractmethod
from typing import Any


class CachePort(ABC):

    @abstractmethod
    async def get(
        self,
        key: str,
    ) -> Any:
        raise NotImplementedError

    @abstractmethod
    async def set(
        self,
        key: str,
        value: Any,
        ttl: int,
    ) -> None:
        raise NotImplementedError