from dataclasses import dataclass, field

from domain.entities.retrieved_document import RetrievedDocument


@dataclass(slots=True)
class AgentContext:

    message: str

    history: list[str] = field(default_factory=list)

    retrieved_docs: list[RetrievedDocument] = field(default_factory=list)

    metadata: dict = field(default_factory=dict)