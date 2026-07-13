"""
Analyze Response Schema
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class AnalyzeResponse(BaseModel):

    #
    # Analysis
    #

    analysis_type: str

    source: str

    risk_score: int

    status: str

    level: str

    confidence: float

    #
    # Detail
    #

    categories: list[str] = Field(default_factory=list)

    indicators: list[str] = Field(default_factory=list)

    reason: list[str] = Field(default_factory=list)

    #
    # Collector
    #

    checks: dict[str, Any] = Field(default_factory=dict)
