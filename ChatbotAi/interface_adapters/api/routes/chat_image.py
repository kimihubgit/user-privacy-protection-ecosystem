from fastapi import APIRouter

from config.di_container import (
    analyze_image_use_case,
)

from interface_adapters.controllers.chat_image_controller import (
    ChatImageController,
)

from interface_adapters.schemas.chat_image_request import (
    ChatImageRequest,
)

router = APIRouter(
    prefix="/api/chat/image",
    tags=["Chat"],
)

controller = ChatImageController(
    analyze_image_use_case()
)


@router.post("/")
async def chat_image(
    request: ChatImageRequest,
):

    return await controller.handle(
        image_base64=request.image_base64,
        message=request.message,
    )
