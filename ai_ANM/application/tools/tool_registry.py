from application.tools.base_tool import BaseTool


class ToolRegistry:

    def __init__(self):
        self._tools: dict[str, BaseTool] = {}

    def register(
        self,
        tool: BaseTool,
    ) -> None:
        self._tools[tool.name] = tool

    def get(
        self,
        name: str,
    ) -> BaseTool:
        return self._tools[name]

    def all(self):
        return list(self._tools.values())

    def exists(
        self,
        name: str,
    ) -> bool:
        return name in self._tools

    def list_tools(
        self,
    ) -> list[str]:
        return list(self._tools.keys())