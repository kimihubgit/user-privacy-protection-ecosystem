from dataclasses import dataclass, field


@dataclass(slots=True)
class AgentResponse:
    reply: str
    success: bool = True
    sources: list[str] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)