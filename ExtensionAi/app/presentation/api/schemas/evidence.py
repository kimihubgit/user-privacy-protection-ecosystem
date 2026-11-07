"""
Evidence Schema

Observation duy nhất được tạo bởi Detector.

Detector chỉ sinh Evidence.

Không được suy luận.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(slots=True)
class Evidence:

    #
    # Detector
    #

    detector: str

    #
    # Evidence Type
    #

    type: str

    #
    # Observation Name
    #

    name: str

    #
    # Giá trị quan sát
    #

    value: str

    #
    # Vị trí
    #

    location: str = ""

    #
    # Ngữ cảnh gốc
    #

    context: str = ""

    #
    # Metadata
    #

    metadata: dict = field(default_factory=dict)