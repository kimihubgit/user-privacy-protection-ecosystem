from typing import AsyncIterator

from application.use_cases.handle_chat_message import (
    HandleChatMessageUseCase,
)

from observability.logger import logger


class ChatStreamController:

    def __init__(
        self,
        use_case: HandleChatMessageUseCase,
    ):

        self.use_case = use_case

    async def handle(
        self,
        message: str,
    ) -> AsyncIterator[str]:

        try:

            async for chunk in self.use_case.execute_stream(
                message
            ):
                yield chunk

        except Exception:

            logger.exception(
                "Lỗi không mong muốn khi streaming câu trả lời.",
            )

            yield (
                "\n\nXin lỗi, hệ thống đang gặp sự cố. "
                "Vui lòng thử lại sau."
            )
