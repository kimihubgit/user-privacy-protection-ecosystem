from dataclasses import dataclass, field


@dataclass(slots=True)
class RiskResult:

    risk_level: str

    confidence: float

    score: int

    reasons: list[str] = field(default_factory=list)