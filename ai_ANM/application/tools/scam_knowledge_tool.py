from config.settings import settings

from application.models.evidence import Evidence
from application.ports.retriever_port import RetrieverPort
from application.tools.base_tool import BaseTool


class ScamKnowledgeTool(BaseTool):

    name = "scam_knowledge"

    description = "Kiến thức lừa đảo"

    def __init__(
        self,
        retriever: RetrieverPort,
        namespace: str,
    ):
        self._retriever = retriever
        self._namespace = namespace

    async def execute(
        self,
        *,
        query: str,
    ) -> Evidence | None:

        documents = await self._retriever.retrieve(
            query=query,
            top_k=settings.TOP_K,
            namespace=self._namespace,
        )

        if not documents:
            return None

        return Evidence(
            sources=[self.name],
            documents=documents,
        )