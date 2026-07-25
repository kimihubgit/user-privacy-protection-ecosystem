from application.use_cases.handle_chat_message import (
    HandleChatMessageUseCase,
)

from domain.entities.agent_response import AgentResponse

from interface_adapters.presenters.chat_response_presenter import (
    ChatResponsePresenter,
)

from observability.logger import logger


class ChatController:

    def __init__(
        self,
        use_case: HandleChatMessageUseCase,
    ):

        self.use_case = use_case

    async def handle(
        self,
        message: str,
    ) -> dict:

        try:

            response = await self.use_case.execute(
                message
            )

        except Exception:

            logger.exception(
                "Lỗi không mong muốn khi xử lý tin nhắn.",
            )

            response = AgentResponse(
                success=False,
                reply=(
                    "Xin lỗi, hệ thống đang gặp sự cố. "
                    "Vui lòng thử lại sau."
                ),
            )

        return ChatResponsePresenter.present(
            response
        )