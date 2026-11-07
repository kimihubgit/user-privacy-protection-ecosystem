from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class ToolCall:

    tool: str

    arguments: dict[str, Any] = field(default_factory=dict)