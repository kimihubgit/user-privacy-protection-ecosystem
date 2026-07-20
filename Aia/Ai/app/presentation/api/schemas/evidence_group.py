"""
Evidence Group Schema

Một Detector sinh ra nhiều Evidence.

Ví dụ:

BrandDetector
    ├── Facebook
    ├── Instagram
    └── Google

KeywordDetector
    ├── login
    ├── otp
    └── password
"""

from __future__ import annotations

from dataclasses import dataclass, field

from app.presentation.api.schemas.evidence import Evidence

@dataclass(slots=True)
class EvidenceGroup:

    #
    # Detector Name
    #

    detector: str

    #
    # Evidence List
    #

    evidences: list[Evidence] = field(
        default_factory=list
    )

    #
    # Add Evidence
    #

    def add(
        self,
        evidence: Evidence
    ) -> None:

        self.evidences.append(
            evidence
        )

    #
    # Merge
    #

    def extend(
        self,
        evidences: list[Evidence]
    ) -> None:

        self.evidences.extend(
            evidences
        )

    #
    # Count
    #

    @property
    def count(
        self
    ) -> int:

        return len(
            self.evidences
        )

    #
    # Empty
    #

    @property
    def empty(
        self
    ) -> bool:

        return self.count == 0

    #
    # Iterator
    #

    def __iter__(
        self
    ):

        return iter(
            self.evidences
        )

    #
    # Length
    #

    def __len__(
        self
    ):

        return len(
            self.evidences
        )