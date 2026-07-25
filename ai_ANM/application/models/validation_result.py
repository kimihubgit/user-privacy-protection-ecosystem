from dataclasses import dataclass, field


@dataclass(slots=True)
class ValidationResult:
    """
    Kết quả kiểm tra câu trả lời (Response Agent sinh ra) có được
    Evidence hỗ trợ đầy đủ hay không (groundedness / chống
    hallucination).
    """

    grounded: bool

    confidence: float = 0.0

    unsupported_claims: list[str] = field(default_factory=list)
