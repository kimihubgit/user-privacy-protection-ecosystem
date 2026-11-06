from application.ports.image_scam_checker_port import (
    ImageScamCheckerPort,
)

from domain.entities.agent_response import AgentResponse


class AnalyzeImageUseCase:

    def __init__(
        self,
        checker: ImageScamCheckerPort,
    ):

        self.checker = checker

    async def execute(
        self,
        image_base64: str,
        message: str = "",
    ) -> AgentResponse:

        return await self.checker.analyze_image(
            image_base64=image_base64,
            message=message,
        )
