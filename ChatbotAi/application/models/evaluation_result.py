from dataclasses import dataclass


@dataclass(slots=True)
class EvaluationResult:

    relevant: bool

    confidence: float

    need_retry: bool

    reason: str = ""