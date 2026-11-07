from abc import ABC, abstractmethod
from typing import Any


class BaseTool(ABC):
    """
    Base class cho tất cả Tool.
    """

    name: str
    description: str

    @abstractmethod
    async def execute(self, **kwargs) -> Any:
        """Thực thi tool"""
        raise NotImplementedError