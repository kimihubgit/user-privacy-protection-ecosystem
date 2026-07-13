"""
Base OSINT Provider
"""

from __future__ import annotations

from abc import ABC
from abc import abstractmethod
from typing import Any


class BaseProvider(ABC):
    """
    Base class cho mọi OSINT Provider.

    Mỗi Provider chỉ chịu trách nhiệm:

    - Query nguồn dữ liệu
    - Parse kết quả
    - Trả về trạng thái chuẩn

    Không chứa logic Risk Score.

    Không chứa logic AI.
    """

    @abstractmethod
    def check(self, url: str) -> dict[str, Any]:
        """
        Query URL.

        Returns
        -------
        {
            "result": "safe"
        }

        hoặc

        {
            "result": "malicious"
        }

        hoặc

        {
            "result": "no result"
        }
        """

        raise NotImplementedError
