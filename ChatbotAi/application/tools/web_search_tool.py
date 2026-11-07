from application.models.evidence import Evidence
from application.ports.web_search_port import WebSearchPort
from application.tools.base_tool import BaseTool


class WebSearchTool(BaseTool):

    name = "web_search"

    description = "Tìm kiếm thông tin trên Internet"

    def __init__(
        self,
        search: WebSearchPort,
    ):
        self._search = search

    async def execute(
        self,
        *,
        query: str,
    ) -> Evidence | None:

        documents = await self._search.search(
            query=query,
        )

        if not documents:
            return None

        return Evidence(
            sources=["tavily"],
            documents=documents,
        )