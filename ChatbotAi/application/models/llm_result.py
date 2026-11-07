from dataclasses import dataclass, field


@dataclass(slots=True)
class LLMResult:
    """
    Kết quả thô từ Response Agent trước khi qua Answer Validation.
    """

    reply: str

    success: bool = True

    confidence: float = 0.0

    reasoning: list[str] = field(default_factory=list)

    citations: list[str] = field(default_factory=list)

    metadata: dict = field(default_factory=dict)