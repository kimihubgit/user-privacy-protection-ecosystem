from pydantic import BaseModel, Field


class CheckResult(BaseModel):

    name: str

    score: int = 0

    confidence: float = 1.0

    passed: bool = True

    reasons: list[str] = Field(default_factory=list)

    metadata: dict = Field(default_factory=dict)