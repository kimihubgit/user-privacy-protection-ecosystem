from dataclasses import dataclass, field


@dataclass(slots=True)
class RetrievedDocument:

    id: str

    content: str

    source: str

    score: float

    metadata: dict = field(default_factory=dict)