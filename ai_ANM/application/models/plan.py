from dataclasses import dataclass, field

from application.models.tool_call import ToolCall


@dataclass(slots=True)
class Plan:

    tools: list[ToolCall] = field(default_factory=list)