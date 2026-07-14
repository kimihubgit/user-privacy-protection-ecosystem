from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class Indicator(BaseModel):

    indicator: str

    reason: str

    severity: Optional[str] = None

    evidence: Optional[str] = None