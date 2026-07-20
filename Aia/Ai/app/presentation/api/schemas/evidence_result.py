"""
Evidence Result Schema

Toàn bộ Observation của hệ thống.

Đây là đầu ra của Evidence Builder
và là đầu vào của Prompt Builder.

Không chứa suy luận.

Author: Anti Scam Detector
"""

from __future__ import annotations

from dataclasses import dataclass, field

from app.presentation.api.schemas.evidence import Evidence
from app.presentation.api.schemas.evidence_group import EvidenceGroup

@dataclass(slots=True)
class EvidenceResult:

    #
    # Detector Groups
    #

    groups: list[EvidenceGroup] = field(
        default_factory=list
    )

    #
    # Add Group
    #

    def add_group(
        self,
        group: EvidenceGroup
    ) -> None:

        self.groups.append(
            group
        )

    #
    # Total Evidence
    #

    @property
    def evidences(
        self
    ) -> list[Evidence]:

        result: list[Evidence] = []

        for group in self.groups:

            result.extend(
                group.evidences
            )

        return result

    #
    # Count Group
    #

    @property
    def group_count(
        self
    ) -> int:

        return len(
            self.groups
        )

    #
    # Count Evidence
    #

    @property
    def evidence_count(
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

        return self.evidence_count == 0

    #
    # Iterator
    #

    def __iter__(
        self
    ):

        return iter(
            self.groups
        )

    #
    # Length
    #

    def __len__(
        self
    ):

        return len(
            self.groups
        )