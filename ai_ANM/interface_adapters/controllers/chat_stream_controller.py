import sys
import traceback
from datetime import datetime
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
        except Exception as e:
            err_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"\n{'='*75}", file=sys.stderr)
            print(f"🚨 [AI_ANM STREAM ERROR] - {err_time}", file=sys.stderr)
            print(f"💬 Tin nhắn stream       : {message}", file=sys.stderr)
            print(f"❌ Loại ngoại lệ (Type)  : {type(e).__name__}", file=sys.stderr)
            print(f"📋 Chi tiết lỗi (Msg)    : {e}", file=sys.stderr)
            print("🔍 Stack Trace chi tiết:", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            print(f"{'='*75}\n", file=sys.stderr)
            sys.stderr.flush()

            logger.exception(
                f"Lỗi không mong muốn khi streaming câu trả lời: {e}",
            )

            yield (
                "\n\nXin lỗi, hệ thống đang gặp sự cố. "
                "Vui lòng thử lại sau."
            )
