"""
Application Settings

Đọc toàn bộ cấu hình từ biến môi trường.
"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Global application settings.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # =========================
    # Application
    # =========================

    APP_NAME: str = "AI Anti Scam Chatbot"

    APP_VERSION: str = "1.0.0"

    ENVIRONMENT: str = "development"

    DEBUG: bool = True

    HOST: str = "0.0.0.0"

    PORT: int = 8000
    ANTI_SCAM_API: str = "http://127.0.0.1:8001"

    # =========================
    # VTrust - Image Scam Analysis
    # =========================

    VTRUST_IMAGE_API: str = "https://vtrust.vn/api/ai-chat-image"

    # Timeout riêng, dài hơn REQUEST_TIMEOUT thông thường vì
    # phân tích ảnh (OCR + AI) thường mất nhiều thời gian hơn.
    VTRUST_IMAGE_TIMEOUT: int = 30

    # =========================
    # Gemini
    # =========================

    GEMINI_API_KEY: str = Field(...)

    GEMINI_MODEL: str = "gemini-2.5-flash"

    # =========================
    # Redis
    # =========================

    REDIS_URL: str = "redis://localhost:6379"

    REDIS_DB: int = 0

    # =========================
    # Pinecone
    # =========================

    PINECONE_API_KEY: str = Field(...)

    PINECONE_INDEX: str

    PINECONE_NAMESPACE_LAW: str = "law"

    PINECONE_NAMESPACE_SCAM: str = "scam"

    # =========================
    # Embedding
    # =========================

    EMBEDDING_MODEL: str = "intfloat/multilingual-e5-large"

    # =========================
    # Retrieval
    # =========================

    TOP_K: int = 5

    # =========================
    # Cache
    # =========================

    CACHE_TTL: int = 60 * 60 * 6

    # =========================
    # HTTP
    # =========================

    REQUEST_TIMEOUT: int = 10

    # =========================
    # CORS
    # =========================

    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()