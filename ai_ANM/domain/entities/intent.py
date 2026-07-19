from dataclasses import dataclass, field

from domain.value_objects.intent_type import IntentType


@dataclass(slots=True)
class Intent:
    """
    Kết quả sau khi phân loại intent.
    """

    intent_type: IntentType

    corrected_text: str = ""

    entities: dict[str, str] = field(default_factory=dict)

    confidence: float = 0.0