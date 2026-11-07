from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings

from interface_adapters.api.routes.chat import (
    router as chat_router,
)

from interface_adapters.api.routes.chat_image import (
    router as chat_image_router,
)

from interface_adapters.api.routes.chat_stream import (
    router as chat_stream_router,
)

from interface_adapters.api.routes.health import (
    router as health_router,
)

app = FastAPI(

    title=settings.APP_NAME,

    version=settings.APP_VERSION,
)

# Cho phép frontend (khác origin) gọi API.
# Danh sách origin được cấu hình qua settings.ALLOWED_ORIGINS (.env).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    chat_router,
)

app.include_router(
    chat_image_router,
)

app.include_router(
    chat_stream_router,
)

app.include_router(
    health_router,
)