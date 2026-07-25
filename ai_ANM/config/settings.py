from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # =====================================================
    # Application
    # =====================================================

    APP_NAME: str = "AI Anti Scam Chatbot"

    APP_VERSION: str = "1.0.0"

    ENVIRONMENT: str = "development"

    DEBUG: bool = True

    HOST: str = "0.0.0.0"

    PORT: int = 8000

    ANTI_SCAM_API: str = "http://127.0.0.1:8001"

    # =====================================================
    # Gemini
    # =====================================================

    GEMINI_API_KEY: str = ...

    GEMINI_MODEL: str = ...

    # Gemini API key riêng cho từng Agent (tùy chọn, để trống nếu
    # muốn dùng chung GEMINI_API_KEY ở trên).

    GEMINI_API_KEY_PLANNER: str = ""

    GEMINI_API_KEY_EVALUATION: str = ""

    GEMINI_API_KEY_QUERY_REWRITE: str = ""

    GEMINI_API_KEY_ANSWER_VALIDATION: str = ""

    GEMINI_API_KEY_RISK_ANALYSIS: str = ""

    GEMINI_API_KEY_RESPONSE: str = ""

    GEMINI_API_KEY_OUTSIDE_SCOPE: str = ""

    EMBEDDING_MODEL: str = ...

    # =====================================================
    # Local LLM (Qwen3 4B qua LM Studio / OpenAI-compatible server)
    # =====================================================

    LOCAL_LLM_PROVIDER: str = "lmstudio"

    LOCAL_LLM_BASE_URL: str = "http://127.0.0.1:1234/v1"

    LOCAL_LLM_API_KEY: str = "lm-studio"

    LOCAL_LLM_MODEL: str = "qwen3-4b-instruct-2507"

    LOCAL_LLM_TEMPERATURE: float = 0.1

    LOCAL_LLM_MAX_TOKENS: int = 512

    # =====================================================
    # Groq (OpenAI-compatible API)
    # =====================================================

    GROQ_API_KEY: str = ""

    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"

    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    GROQ_TEMPERATURE: float = 0.3

    GROQ_MAX_TOKENS: int = 1024

    # Groq API key riêng cho từng Agent (tùy chọn, để trống nếu
    # muốn dùng chung GROQ_API_KEY ở trên).

    GROQ_API_KEY_RESPONSE: str = ""

    GROQ_API_KEY_EVALUATION: str = ""

    # =====================================================
    # Agent Provider
    #
    # Mỗi Agent chọn provider chính: "local" | "groq" | "gemini".
    # Nếu provider chính lỗi (timeout, key sai, server sập...),
    # Agent sẽ tự động fallback sang Gemini.
    # =====================================================

    PLANNER_PROVIDER: str = "gemini"

    EVALUATION_PROVIDER: str = "gemini"

    QUERY_REWRITE_PROVIDER: str = "gemini"

    ANSWER_VALIDATION_PROVIDER: str = "gemini"

    RESPONSE_PROVIDER: str = "gemini"

    # =====================================================
    # Search / External
    # =====================================================

    TAVILY_API_KEY: str = ...

    VTRUST_IMAGE_API: str = "https://vtrust.vn/api/ai-chat-image"

    VTRUST_IMAGE_TIMEOUT: int = 60

    # =====================================================
    # Pinecone
    # =====================================================

    PINECONE_API_KEY: str = ...

    PINECONE_INDEX: str = ...

    PINECONE_NAMESPACE_LAW: str = ...

    PINECONE_NAMESPACE_SCAM: str = ...

    # =====================================================
    # Redis
    # =====================================================

    REDIS_URL: str = "redis://localhost:6379"

    REDIS_DB: int = 0

    # =====================================================
    # Retrieval
    # =====================================================

    TOP_K: int = 5

    # =====================================================
    # HTTP
    # =====================================================

    REQUEST_TIMEOUT: int = 10

    # =====================================================
    # Cache
    # =====================================================

    CACHE_TTL: int = 21600

    # =====================================================
    # CORS
    # =====================================================

    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
