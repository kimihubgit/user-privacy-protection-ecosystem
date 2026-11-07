from application.models.tool_call import ToolCall
from application.tools.tool_registry import ToolRegistry


class ToolExecutorAgent:

    def __init__(
        self,
        registry: ToolRegistry,
    ):
        self._registry = registry

    async def execute(
        self,
        tool_call: ToolCall,
    ):

        tool = self._registry.get(
            tool_call.tool,
        )

        return await tool.execute(
            **tool_call.arguments,
        )