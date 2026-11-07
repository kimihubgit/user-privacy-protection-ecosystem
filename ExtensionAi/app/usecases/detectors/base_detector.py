"""
Base Detector

Mọi Detector kế thừa từ lớp này.

Detector chỉ tạo Observation.

Không được:
- tính Risk
- kết luận Scam
- suy luận

Author: Anti Scam Detector
"""

from __future__ import annotations

from abc import ABC
from abc import abstractmethod

from app.presentation.api.schemas.evidence_group import EvidenceGroup

class BaseDetector(ABC):

    """
    Base Detector
    """

    def __init__(self):

        self.name = self.__class__.__name__

    @abstractmethod
    def detect(self, *args, **kwargs) -> EvidenceGroup:
        """
        Detect observations.

        Returns
        -------
        EvidenceGroup
        """
        raise NotImplementedError

    def create_group(self) -> EvidenceGroup:

        return EvidenceGroup(

            detector=self.name

        )