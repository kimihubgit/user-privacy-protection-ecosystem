from fastapi import APIRouter

from config.di_container import (
    handle_chat_message_use_case,
)

from interface_adapters.controllers.chat_controller import (
    ChatController,
)

from interface_adapters.schemas.chat_request import (
    ChatRequest,
)

router = APIRouter(
    prefix="/api/chat",
    tags=["Chat"],
)

controller = ChatController(
    handle_chat_message_use_case()
)


@router.post("/")
async def chat(
    request: ChatRequest,
):

    return await controller.handle(
        request.message
    )