"""
Base LLM

Định nghĩa interface chung cho tất cả
các mô hình ngôn ngữ lớn (LLM).

"""

from __future__ import annotations

from abc import ABC
from abc import abstractmethod


class BaseLLM(ABC):
    """
    Abstract Base Class cho các LLM Provider.
    """

    @abstractmethod
    def generate(self, prompt: str) -> str:
        """
        Sinh phản hồi từ Prompt.

        Parameters
        ----------
        prompt : str
            Prompt gửi tới mô hình.

        Returns
        -------
        str
            Chuỗi phản hồi từ LLM.
        """
        raise NotImplementedError
