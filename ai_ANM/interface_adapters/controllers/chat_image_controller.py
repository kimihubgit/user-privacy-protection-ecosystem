import sys
import traceback
from datetime import datetime

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
        except Exception as e:
            err_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"\n{'='*75}", file=sys.stderr)
            print(f"🚨 [AI_ANM IMAGE OCR ERROR] - {err_time}", file=sys.stderr)
            print(f"💬 Tin nhắn kèm ảnh      : {message}", file=sys.stderr)
            print(f"❌ Loại ngoại lệ (Type)  : {type(e).__name__}", file=sys.stderr)
            print(f"📋 Chi tiết lỗi (Msg)    : {e}", file=sys.stderr)
            print("🔍 Stack Trace chi tiết:", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            print(f"{'='*75}\n", file=sys.stderr)
            sys.stderr.flush()

            logger.exception(
                f"Lỗi không mong muốn khi phân tích ảnh: {e}",
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
