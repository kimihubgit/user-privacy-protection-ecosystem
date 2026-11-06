from dataclasses import dataclass, field


@dataclass(slots=True)
class DocumentChunk:
    """
    Một đoạn tài liệu được lưu trong Vector Database.
    """

    id: str

    namespace: str

    text: str

    metadata: dict[str, str | int | float] = field(default_factory=dict)