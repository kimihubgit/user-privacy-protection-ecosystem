import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from config.di_container import (
    handle_chat_message_use_case,
)

from interface_adapters.controllers.chat_stream_controller import (
    ChatStreamController,
)

from interface_adapters.schemas.chat_request import (
    ChatRequest,
)

router = APIRouter(
    prefix="/api/chat",
    tags=["Chat"],
)

controller = ChatStreamController(
    handle_chat_message_use_case()
)


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
):
    """
    Trả lời theo dạng streaming (Server-Sent Events).

    Mỗi sự kiện có dạng: data: {"chunk": "..."}\n\n
    Kết thúc bằng: data: [DONE]\n\n
    """

    async def event_generator():

        async for chunk in controller.handle(
            request.message
        ):

            payload = json.dumps({"chunk": chunk}, ensure_ascii=False)

            yield f"data: {payload}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
