from application.models.evidence import Evidence
from application.tools.base_tool import BaseTool

from domain.entities.retrieved_document import RetrievedDocument

from infrastructure.external.anti_scam_backend_adapter import (
    AntiScamBackendAdapter,
)


class URLCheckerTool(BaseTool):

    name = "url_checker"

    description = "Kiểm tra URL độc hại"

    def __init__(
        self,
        backend: AntiScamBackendAdapter,
    ):
        self._backend = backend

    async def execute(
        self,
        *,
        url: str,
    ) -> Evidence | None:

        result = await self._backend.check_url(
            url,
        )

        if result is None:
            return None

        document = RetrievedDocument(
            id=f"url_checker:{url}",
            content=result.reply,
            source=self.name,
            score=1.0 if result.success else 0.0,
            metadata={
                "url": url,
                "success": result.success,
                **result.metadata,
            },
        )

        return Evidence(
            sources=[self.name],
            documents=[document],
        )