import sys
import traceback
from datetime import datetime

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
        except Exception as e:
            err_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"\n{'='*75}", file=sys.stderr)
            print(f"🚨 [AI_ANM CHATBOT ERROR] - {err_time}", file=sys.stderr)
            print(f"💬 Tin nhắn người dùng : {message}", file=sys.stderr)
            print(f"❌ Loại ngoại lệ (Type) : {type(e).__name__}", file=sys.stderr)
            print(f"📋 Chi tiết lỗi (Msg)   : {e}", file=sys.stderr)
            print("🔍 Stack Trace chi tiết:", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            print(f"{'='*75}\n", file=sys.stderr)
            sys.stderr.flush()

            logger.exception(
                f"Lỗi không mong muốn khi xử lý tin nhắn: {e}",
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
