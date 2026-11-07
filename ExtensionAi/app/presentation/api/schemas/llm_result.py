from typing import List
from typing import Optional

from pydantic import BaseModel

from app.presentation.api.schemas.indicator import Indicator


class LLMResult(BaseModel):

    analysis_type: str

    risk_score: int

    status: str

    level: str

    confidence: float

    categories: List[str]

    indicators: List[Indicator]

    summary: Optional[str] = None

    reason: List[str]

    recommendations: List[str] = []