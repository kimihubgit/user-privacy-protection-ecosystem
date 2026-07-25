from application.use_cases.analyze_image import (
    AnalyzeImageUseCase,
)

from domain.entities.agent_response import AgentResponse

from interface_adapters.presenters.chat_response_presenter import (
    ChatResponsePresenter,
)

from observability.logger import logger


class ChatImageController:

    def __init__(
        self,
        use_case: AnalyzeImageUseCase,
    ):

        self.use_case = use_case

    async def handle(
        self,
        image_base64: str,
        message: str = "",
    ) -> dict:

        try:

            response = await self.use_case.execute(
                image_base64=image_base64,
                message=message,
            )

        except Exception:

            logger.exception(
                "Lỗi không mong muốn khi phân tích ảnh.",
            )

            response = AgentResponse(
                success=False,
                reply=(
                    "Xin lỗi, hệ thống đang gặp sự cố khi phân tích "
                    "ảnh. Vui lòng thử lại sau."
                ),
            )

        return ChatResponsePresenter.present(
            response
        )
